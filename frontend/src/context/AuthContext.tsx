import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, LogIn, X, Clock } from 'lucide-react';

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

export interface SessionExpiredState {
  isExpired: boolean;
  reason: 'inactivity' | 'token_expired' | 'unauthorized' | 'manual';
  message: string;
}

interface AuthContextType {
  user: UserContextData | null;
  token: string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
  sessionExpired: SessionExpiredState | null;
  dismissSessionExpired: () => void;
  login: (token: string, user: UserContextData) => void;
  logout: (reason?: 'inactivity' | 'token_expired' | 'unauthorized' | 'manual') => void;
  updateUser: (user: Partial<UserContextData>) => void;
  refreshUser: () => Promise<void>;
  recordActivity: () => void;
  // Auth Modal State & Controls
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 15 Minutes Inactivity Limit (in milliseconds)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const STORAGE_KEY_TOKEN = 'bitblog_token';
const STORAGE_KEY_USER = 'bitblog_user';
const STORAGE_KEY_LAST_ACTIVITY = 'bitblog_last_activity';

// Helper to decode JWT and check if expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (parsed && typeof parsed.exp === 'number') {
      // Return true if expired or expiring in less than 2 seconds
      return parsed.exp * 1000 <= Date.now() + 2000;
    }
    return false;
  } catch {
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem('modernblog_token');
    if (t && isTokenExpired(t)) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem('modernblog_token');
      return null;
    }
    return t;
  });

  const [user, setUser] = useState<UserContextData | null>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem('modernblog_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [sessionExpired, setSessionExpired] = useState<SessionExpiredState | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  const lastActivityThrottledRef = useRef<number>(Date.now());

  // Record user activity timestamp
  const recordActivity = useCallback(() => {
    const now = Date.now();
    // Throttle writing to localStorage to once every 10 seconds
    if (now - lastActivityThrottledRef.current > 10000) {
      lastActivityThrottledRef.current = now;
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
    }
  }, []);

  const openAuthModal = useCallback((mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const dismissSessionExpired = useCallback(() => {
    setSessionExpired(null);
  }, []);

  const logout = useCallback((reason: 'inactivity' | 'token_expired' | 'unauthorized' | 'manual' = 'manual') => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
    localStorage.removeItem('modernblog_token');
    localStorage.removeItem('modernblog_user');
    setToken(null);
    setUser(null);

    if (reason !== 'manual') {
      const message =
        reason === 'inactivity'
          ? 'Your session was automatically logged out after 15 minutes of inactivity.'
          : 'Your session has expired. Please sign in again to continue.';

      setSessionExpired({
        isExpired: true,
        reason,
        message,
      });
    }
  }, []);

  const login = useCallback((newToken: string, newUser: UserContextData) => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
    lastActivityThrottledRef.current = now;

    setToken(newToken);
    setUser(newUser);
    setSessionExpired(null);
  }, []);

  const updateUser = useCallback((updatedFields: Partial<UserContextData>) => {
    setUser(prev => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Fetch latest profile & role from backend to keep active session synchronized
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem('modernblog_token');
    if (!currentToken) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setUser(prev => {
            const merged = { ...(prev || {}), ...json.data };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch {
      // Background sync, suppress network errors
    }
  }, []);

  // Synchronize user role upon initial mount if authenticated
  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  const isAuthenticated = !!token && !!user;
  const role = user?.role || '';
  const isAdmin = role === 'Admin';
  const isEditor = role === 'Editor' || isAdmin;
  const isAuthor = role === 'Author' || isEditor;
  const isStaff = isAuthor;

  // 1. Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_TOKEN || e.key === STORAGE_KEY_USER) {
        const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (!storedToken || !storedUser) {
          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      } else if (e.key === STORAGE_KEY_LAST_ACTIVITY) {
        const newTimestamp = parseInt(e.newValue || '0', 10);
        if (newTimestamp > 0) {
          lastActivityThrottledRef.current = newTimestamp;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 2. User activity tracking listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize activity timestamp if not set
    if (!localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY)) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
      lastActivityThrottledRef.current = now;
    }

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const onUserActivity = () => {
      recordActivity();
    };

    activityEvents.forEach(evt => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, onUserActivity);
      });
    };
  }, [isAuthenticated, recordActivity]);

  // 3. Inactivity & JWT Expiration background timer
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const checkExpiration = () => {
      // Check 1: JWT token expiration
      if (isTokenExpired(token)) {
        logout('token_expired');
        return;
      }

      // Check 2: 15-minute inactivity limit
      const lastActiveStr = localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY);
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : lastActivityThrottledRef.current;
      const now = Date.now();

      if (lastActive && now - lastActive >= INACTIVITY_TIMEOUT_MS) {
        logout('inactivity');
      }
    };

    // Check immediately and every 5 seconds
    checkExpiration();
    const interval = setInterval(checkExpiration, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token, logout]);

  // 4. Listen to global 401 Session-Expired custom events from api.ts
  useEffect(() => {
    const handleSessionExpiredEvent = (e: CustomEvent<{ message?: string }>) => {
      if (isAuthenticated) {
        logout('token_expired');
      }
    };

    window.addEventListener('bitblog:session-expired' as any, handleSessionExpiredEvent);
    return () => window.removeEventListener('bitblog:session-expired' as any, handleSessionExpiredEvent);
  }, [isAuthenticated, logout]);

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
        sessionExpired,
        dismissSessionExpired,
        login,
        logout,
        updateUser,
        refreshUser,
        recordActivity,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}

      {/* Floating Session Expiration Alert Modal/Toast */}
      {sessionExpired && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 99999,
            maxWidth: '420px',
            width: 'calc(100% - 2.5rem)',
            background: 'var(--color-surface, #ffffff)',
            color: 'var(--color-text, #1e293b)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--color-border, #e2e8f0)',
            borderLeft: '5px solid #EF4444',
            padding: '1rem 1.25rem',
            animation: 'slideInRight 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444',
                  flexShrink: 0,
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                  Session Expired
                </h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: 'var(--color-text-muted, #64748b)', lineHeight: 1.4 }}>
                  {sessionExpired.message}
                </p>
              </div>
            </div>
            <button
              onClick={dismissSessionExpired}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted, #94a3b8)',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.25rem' }}>
            <button
              onClick={dismissSessionExpired}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--color-text, #475569)',
                background: 'var(--color-bg, #f1f5f9)',
                border: '1px solid var(--color-border, #cbd5e1)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                dismissSessionExpired();
                openAuthModal('login');
              }}
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#ffffff',
                background: 'var(--color-primary, #4F46E5)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LogIn size={14} />
              Sign In Again
            </button>
          </div>
        </div>
      )}
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

