import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { formatINR } from "../data";
import { Button } from "../components/ui/Button";
import { ErrorState, LoadingState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { cancelBooking, fetchBookings } from "../lib/api";
import type { Booking } from "../types";

const statusClasses: Record<Booking["status"], string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  completed: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
};

export function BookingsPage() {
  usePageTitle("My Bookings");
  const { data, loading, error, refetch } = useApi<Booking[]>(fetchBookings, []);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const sortedBookings = useMemo(
    () => (data ? [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []),
    [data],
  );

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    setCancelError(null);
    try {
      await cancelBooking(id);
      refetch();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Could not cancel this booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container-x py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">My bookings</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Your appointments</h1>
        </div>
        <Button to="/tests" variant="outline">Book another test</Button>
      </div>

      {cancelError && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {cancelError}
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingState label="Loading your bookings…" />
        </div>
      ) : error ? (
        <div className="mt-8">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      ) : sortedBookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <ShieldCheck className="mx-auto size-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">No bookings yet</h2>
          <p className="mt-2 text-sm text-slate-600">Your bookings will appear here after you confirm a lab test.</p>
          <Button to="/tests" className="mt-6">Browse tests</Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {sortedBookings.map((booking) => (
            <li key={booking.id} className="card p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{booking.testName}</h2>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{booking.labName}</p>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4 text-primary-600" aria-hidden="true" />
                      {booking.preferredDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4 text-primary-600" aria-hidden="true" />
                      {booking.preferredTime}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-primary-600" aria-hidden="true" />
                      {booking.collectionMode === "home" ? "Home collection" : "Visit lab"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <div className="text-left sm:text-right">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Reference</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.reference}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="text-sm font-semibold text-primary-700 hover:text-primary-800"
                    >
                      View details
                    </Link>
                    {booking.status !== "cancelled" && booking.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">{formatINR(booking.amount)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
