import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { FieldError, Input, Label } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function SignupPage() {
  usePageTitle("Create account");
  const { isAuthenticated, initializing, signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Wait for the session restore before deciding whether to redirect.
  if (initializing) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (phone.trim() && !/^\d{10}$/.test(phone.replace(/\s+/g, ""))) {
      nextErrors.phone = "Use a valid 10-digit mobile number.";
    }
    if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await signup({ name, email, phone, password });
    setSubmitting(false);
    if (result.error) {
      setErrors({ form: result.error });
      return;
    }
    navigate("/account", { replace: true });
  };

  return (
    <div className="container-x flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary-50 text-primary-600">
              <UserPlus className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Save your details for faster bookings and home sample collection.
            </p>
          </div>

          {errors.form && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                autoComplete="name"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              <FieldError>{errors.name}</FieldError>
            </div>
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              <FieldError>{errors.email}</FieldError>
            </div>
            <div>
              <Label htmlFor="signup-phone">Mobile number (optional)</Label>
              <Input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
              />
              <FieldError>{errors.phone}</FieldError>
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              <FieldError>{errors.password}</FieldError>
            </div>
            <div>
              <Label htmlFor="signup-confirm-password">Confirm password</Label>
              <Input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!!errors.confirmPassword}
              />
              <FieldError>{errors.confirmPassword}</FieldError>
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-2" disabled={submitting}>
              <UserPlus className="size-4.5" aria-hidden="true" />
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
              Sign in
            </Link>
          </p>
        </div>          <p className="mt-4 text-center text-xs text-slate-500">
            Your details are protected — passwords are stored securely on the server.
          </p>
      </div>
    </div>
  );
}
