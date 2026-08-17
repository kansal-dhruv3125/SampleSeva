import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Clock3, Home, MapPin, Phone, UserRound } from "lucide-react";
import { formatINR } from "../data";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { cancelBooking, fetchBookingById } from "../lib/api";
import type { Booking } from "../types";

export function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, loading, error, refetch } = useApi<Booking | null>(
    () => (id ? fetchBookingById(id) : Promise.resolve(null)),
    [id],
  );
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  usePageTitle(booking ? `Booking ${booking.reference}` : "Booking not found");

  if (loading) {
    return <LoadingState label="Loading booking…" />;
  }

  if (error || !booking) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Booking not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          {error && error !== "Booking not found."
            ? "This booking could not be loaded. Please try again."
            : "This booking could not be located, or you do not have access to it."}
        </p>
        {error && (
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Try again
          </Button>
        )}
        <Button to="/bookings" className="mt-6">Back to bookings</Button>
      </div>
    );
  }

  const statusStyles: Record<Booking["status"], string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    completed: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelBooking(booking.id);
      refetch();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Could not cancel this booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container-x py-10 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">Booking details</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{booking.reference}</h1>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${statusStyles[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      {cancelError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {cancelError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Appointment summary</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Test</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{booking.testName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Lab</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{booking.labName}</p>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Patient details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-4 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Name</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{booking.patient.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Phone</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{booking.patient.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Date of birth</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{booking.patient.dob || "Not supplied"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Preferred slot</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{booking.preferredTime}</p>
                </div>
              </div>
            </div>
          </section>

          {booking.address && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900">Collection address</h2>
              <div className="mt-4 flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-primary-600" aria-hidden="true" />
                <div className="text-sm text-slate-700">
                  <p>{booking.address.line1}</p>
                  {booking.address.line2 && <p>{booking.address.line2}</p>}
                  {booking.address.locality && <p>{booking.address.locality}</p>}
                  <p>{booking.address.city}, {booking.address.state} - {booking.address.pincode}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-semibold text-slate-900">Payment summary</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-4">
              <dt>Test amount</dt>
              <dd className="font-semibold text-slate-900">{formatINR(booking.amount)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Collection fee</dt>
              <dd className="font-semibold text-slate-900">{formatINR(booking.collectionFee)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
              <dt>Total</dt>
              <dd>{formatINR(booking.amount + booking.collectionFee)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="flex items-center gap-2 font-medium text-slate-800">
              <Home className="size-4 text-primary-600" aria-hidden="true" />
              {booking.collectionMode === "home" ? "Home collection" : "Visit lab"}
            </p>
            <p className="mt-2">Preferred date: {booking.preferredDate}</p>
            <p>Report window: {booking.expectedReportTime}</p>
          </div>

          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <Button
              fullWidth
              variant="outline"
              className="mt-6"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Cancel booking"}
            </Button>
          )}

          <Link to="/bookings" className="mt-3 block text-center text-sm font-semibold text-primary-700 hover:text-primary-800">
            Back to bookings
          </Link>
        </aside>
      </div>
    </div>
  );
}
