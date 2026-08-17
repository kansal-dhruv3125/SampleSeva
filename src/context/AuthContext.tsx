import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "../types";
import { fetchAuthUser, loginUser as apiLogin, logoutUser as apiLogout, signupUser as apiSignup } from "../lib/api";

interface AuthResult {
  user?: AuthUser;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until the initial session restore (GET /api/auth/me) completes. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (input: { name: string; email: string; phone?: string; password: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore the session on first load — the httpOnly session cookie is sent
  // with GET /api/auth/me, so a browser refresh keeps the user signed in.
  useEffect(() => {
    let cancelled = false;
    fetchAuthUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      initializing,
      login: async (email, password) => {
        try {
          const u = await apiLogin({ email, password });
          setUser(u);
          return { user: u };
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Sign-in failed. Please try again." };
        }
      },
      signup: async (input) => {
        try {
          const u = await apiSignup(input);
          setUser(u);
          return { user: u };
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Sign-up failed. Please try again." };
        }
      },
      logout: async () => {
        try {
          await apiLogout();
        } catch {
          // Clear the local session regardless of network/server issues.
        }
        setUser(null);
      },
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
