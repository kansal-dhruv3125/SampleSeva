import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingState } from "../ui/AsyncState";

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: string[];
}

/**
 * Route guard — redirects to /login when logged out,
 * or to / when the user's role is not in allowedRoles.
 */
export function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { user, isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingState label="Loading your account…" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
