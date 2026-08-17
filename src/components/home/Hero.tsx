import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CircleCheck,
  Clock,
  IndianRupee,
  MapPin,
  Star,
} from "lucide-react";
import { SearchBar } from "../search/SearchBar";
import { Button } from "../ui/Button";

const TRY_QUERIES = ["CBC", "Vitamin D", "Thyroid Profile", "Full Body Checkup"];
const TRUST_POINTS = ["Convenient home sample collection", "Transparent pricing", "Trusted labs"];

export function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section
      aria-label="Introduction"
      className="relative overflow-hidden bg-[radial-gradient(70%_60%_at_50%_0%,#f0fdfa_0%,rgba(240,253,250,0)_70%)]"
    >
      <div className="container-x grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* Left: copy + search */}
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-xs font-medium text-primary-700 shadow-card">
            <MapPin className="size-3.5" aria-hidden="true" />
            Now serving Rajpura, Patiala, Chandigarh &amp; Mohali
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl xl:text-[3.4rem] xl:leading-[1.1]">
            Diagnostic Tests,{" "}
            <span className="text-primary-600">Delivered to Your Door.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Compare lab tests, prices and home collection options from trusted diagnostic
            laboratories near you.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/tests" size="lg">
              Book a Test
              <ArrowRight className="size-4.5" aria-hidden="true" />
            </Button>
            <Button to="/packages" variant="secondary" size="lg">
              Explore Health Packages
            </Button>
          </div>

          <div className="mt-8 max-w-xl">
            <SearchBar
              size="lg"
              value={query}
              onValueChange={setQuery}
              placeholder="Search for a test, package or health checkup..."
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-500">
            <span>Try:</span>
            {TRY_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuery(q)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-700"
              >
                {q}
              </button>
            ))}
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <Check className="size-4 text-primary-600" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: product preview visual (desktop only) */}
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="absolute -right-10 -top-12 size-64 rounded-full bg-primary-100/70 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-sky-100/60 blur-3xl" />

          {/* Booking preview card */}
          <div className="relative mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card-hover">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Book a home collection</p>
              <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-700">
                Demo
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">CBC (Complete Blood Count)</p>
                  <p className="mt-0.5 text-xs text-slate-500">1 test · Home sample collection</p>
                </div>
                <p className="text-sm font-bold text-slate-900">₹249</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <p className="text-xs font-medium text-slate-500">Choose your lab</p>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">MediTrust Diagnostics</p>
                  <p className="flex items-center gap-1 text-xs font-medium text-slate-600">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    4.6 · 1.2 km
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div>
                  <p className="text-xs font-medium text-slate-500">Collection slot</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">Tomorrow · 8–10 AM</p>
                </div>
                <CalendarClock className="size-5 text-primary-600" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-lg font-bold text-slate-900">₹249</p>
              </div>
              <Link
                to="/tests/cbc"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-float transition-colors hover:bg-primary-700"
              >
                Book Now
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Floating chips */}
          <div className="absolute -right-4 top-16 animate-float rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CircleCheck className="size-5" aria-hidden="true" />
              Home collection available
            </p>
          </div>
          <div className="absolute -left-6 bottom-24 animate-float-delayed rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock className="size-5 text-primary-600" aria-hidden="true" />
              Reports in 24 hours
            </p>
          </div>
          <div className="absolute -bottom-6 right-10 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <IndianRupee className="size-5 text-primary-600" aria-hidden="true" />
              Compare prices across labs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
