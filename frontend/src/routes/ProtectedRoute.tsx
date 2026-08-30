import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'User' | 'Author' | 'Editor' | 'Admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'User',
}) => {
  const { isAuthenticated, user, isStaff, isEditor, isAdmin } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || requiredRole === 'Admin' || requiredRole === 'Editor' || requiredRole === 'Author';

  if (!isAuthenticated) {
    // Keep Super Admin Login gateway 100% private/secret.
    // Never redirect unauthenticated users to /admin/login automatically.
    // Always redirect to standard public /login gateway.
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // RBAC permissions check: if simple user attempts to access /admin routes, block and route to user dashboard
  if (requiredRole === 'Admin' && !isAdmin) {
    return <Navigate to={isStaff ? '/admin' : '/user/dashboard'} replace />;
  }

  if (requiredRole === 'Editor' && !isEditor) {
    return <Navigate to={isStaff ? '/admin' : '/user/dashboard'} replace />;
  }

  if (requiredRole === 'Author' && !isStaff) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

// Route wrapper for Guest-only pages (e.g. /login, /register, /forgot-password)
export const GuestRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isStaff } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl) {
      return <Navigate to={redirectUrl} replace />;
    }
    return <Navigate to={isStaff ? '/admin' : '/user/dashboard'} replace />;
  }

  return children;
};
