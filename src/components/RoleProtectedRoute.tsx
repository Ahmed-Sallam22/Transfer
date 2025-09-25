import type { ReactElement } from "react";
import { useUserRole, useUserLevel } from "../features/auth/hooks";

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
  fallback = (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  ),
}: RoleProtectedRouteProps) {
  const userRole = useUserRole();
  const userLevel = useUserLevel();

  // Check role-based access
  const hasRoleAccess =
    allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole));

  // Check level-based access
  const hasLevelAccess =
    allowedLevels.length === 0 ||
    (userLevel !== null && allowedLevels.includes(userLevel));

  // Grant access if user meets either role OR level requirements
  // Super admin has access to everything, otherwise check level permissions
  const hasAccess = hasRoleAccess || hasLevelAccess;

  if (!hasAccess) {
    return fallback;
  }

  return children;
}
