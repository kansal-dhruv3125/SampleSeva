import { Navigate, useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { fetchAddresses } from "../lib/api";

export function AccountPage() {
  usePageTitle("My Account");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: savedAddresses } = useApi(fetchAddresses, []);
  const addresses = savedAddresses ?? [];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <PageHeader
        eyebrow="My account"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Manage your profile, saved addresses and bookings."
      />
      <div className="container-x py-10 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card p-6 sm:p-7 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-5 text-primary-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Name</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{user.name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 text-primary-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Email</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{user.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 text-primary-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Mobile</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{user.phone || "Not supplied"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 text-primary-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Member since</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{memberSince}</dd>
                </div>
              </div>
            </dl>
          </section>

          <aside className="space-y-4">
            <section className="card p-6">
              <h2 className="text-sm font-semibold text-slate-900">Saved addresses</h2>
              <p className="mt-1 text-sm text-slate-600">
                {addresses.length === 0
                  ? "No saved addresses yet."
                  : `${addresses.length} saved address${addresses.length === 1 ? "" : "es"} for faster home collection.`}
              </p>
              <Button to="/account/addresses" variant="outline" fullWidth className="mt-4">
                <MapPin className="size-4" aria-hidden="true" />
                Manage addresses
              </Button>
            </section>

            <section className="card p-6">
              <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
              <div className="mt-4 space-y-2.5">
                <Button to="/bookings" fullWidth>
                  My Bookings
                </Button>
                <Button to="/tests" variant="outline" fullWidth>
                  Book a Test
                </Button>
                <Button variant="outline" fullWidth onClick={handleSignOut}>
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
