import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import { TanfeezLoader } from '../components/ui';

interface ProtectedRouteProps {
  children: ReactElement;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/sign-in' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to={redirectTo}  replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect to app
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/app';
    return <Navigate to={from} replace />;
  }

  // Show loader if authentication status is being determined
  if (requireAuth && isAuthenticated && !user) {
    return <TanfeezLoader />;
  }

  return children;
}
