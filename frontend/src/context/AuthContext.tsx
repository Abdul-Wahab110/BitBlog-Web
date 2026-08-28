import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserContextData {
  userId?: number;
  user_id?: number;
  name: string;
  username: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Author' | 'User';
  status?: string;
  avatar_url?: string;
  profile_image?: string;
  profileImage?: string;
  bio?: string;
  website?: string;
  author_tags?: string[];
  social_links?: any;
  short_description?: string;
}

export type AuthModalMode = 'login' | 'register' | 'forgot';

interface AuthContextType {
  user: UserContextData | null;
  token: string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
  login: (token: string, user: UserContextData) => void;
  logout: () => void;
  updateUser: (user: Partial<UserContextData>) => void;
  // Auth Modal State & Controls
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bitblog_token') || localStorage.getItem('modernblog_token'));
  const [user, setUser] = useState<UserContextData | null>(() => {
    const savedUser = localStorage.getItem('bitblog_user') || localStorage.getItem('modernblog_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  const openAuthModal = useCallback((mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const isAuthenticated = !!token && !!user;
  const role = user?.role || '';
  const isAdmin = role === 'Admin';
  const isEditor = role === 'Editor' || isAdmin;
  const isAuthor = role === 'Author' || isEditor;
  const isStaff = isAuthor;

  const login = useCallback((newToken: string, newUser: UserContextData) => {
    localStorage.setItem('bitblog_token', newToken);
    localStorage.setItem('bitblog_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bitblog_token');
    localStorage.removeItem('bitblog_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedFields: Partial<UserContextData>) => {
    setUser(prev => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('bitblog_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bitblog_token' || e.key === 'bitblog_user') {
        const storedToken = localStorage.getItem('bitblog_token');
        const storedUser = localStorage.getItem('bitblog_user');
        setToken(storedToken);
        try {
          setUser(storedUser ? JSON.parse(storedUser) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isStaff,
        isAdmin,
        isEditor,
        isAuthor,
        login,
        logout,
        updateUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
