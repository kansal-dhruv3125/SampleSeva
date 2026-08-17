import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingState } from "../ui/AsyncState";

/** Route guard — redirects to /login (remembering the destination) when logged out. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  // Wait for the initial session restore so a logged-in user refreshing the
  // page isn't briefly treated as logged out.
  if (initializing) {
    return <LoadingState label="Loading your account…" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
}
