import type { ReactElement } from 'react';
import { useUserRole, useUserLevel } from '../features/auth/hooks';

interface RoleProtectedRouteProps {
  children: ReactElement;
  allowedRoles?: string[];
  allowedLevels?: number[];
  fallback?: ReactElement;
}

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles = [], 
  allowedLevels = [],
  fallback = <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
}: RoleProtectedRouteProps) {
  const userRole = useUserRole();
  const userLevel = useUserLevel();

  // Check role-based access
  const hasRoleAccess = allowedRoles.length === 0 || 
    (userRole && allowedRoles.includes(userRole));

  // Check level-based access
  const hasLevelAccess = allowedLevels.length === 0 || 
    (userLevel !== null && allowedLevels.includes(userLevel));

  // Grant access if user meets either role or level requirements
  // If both are specified, user must meet both requirements
  const hasAccess = allowedRoles.length > 0 && allowedLevels.length > 0
    ? hasRoleAccess && hasLevelAccess  // Both conditions must be met
    : hasRoleAccess || hasLevelAccess; // Either condition can be met

  if (!hasAccess) {
    return fallback;
  }

  return children;
}
