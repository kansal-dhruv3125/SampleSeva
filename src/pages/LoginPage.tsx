import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, LogIn } from "lucide-react";
import { Button } from "../components/ui/Button";
import { FieldError, Input, Label } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function LoginPage() {
  usePageTitle("Login");
  const { isAuthenticated, initializing, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Wait for the session restore before deciding whether to redirect.
  if (initializing) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.error) {
      setErrors({ form: result.error });
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="container-x flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary-50 text-primary-600">
              <KeyRound className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Sign in to manage your bookings, saved addresses and account.
            </p>
          </div>

          {errors.form && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              <FieldError>{errors.email}</FieldError>
            </div>
            <div className="mt-4">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              <FieldError>{errors.password}</FieldError>
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-6" disabled={submitting}>
              <LogIn className="size-4.5" aria-hidden="true" />
              {submitting ? "Signing in…" : "Continue to sign in"}
            </Button>
          </form>

          <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            New to SampleSeva?{" "}
            <Link to="/signup" className="font-semibold text-primary-700 hover:text-primary-800">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Button to="/tests" variant="ghost" size="sm">
            Back to browsing tests
          </Button>
        </div>
      </div>
    </div>
  );
}
