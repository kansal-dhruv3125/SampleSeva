import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, CircleCheck, FlaskConical, Sparkles } from "lucide-react";
import { formatINR } from "../data";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { BookingModal } from "../components/home/BookingModal";
import { LoadingState, ErrorState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { fetchPackageBySlug } from "../lib/api";

export function PackageDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [bookingOpen, setBookingOpen] = useState(false);
  const pkgState = useApi(
    () => (slug ? fetchPackageBySlug(slug) : Promise.reject(new Error("Package not found"))),
    [slug],
  );

  const pkg = pkgState.data;
  usePageTitle(pkg?.name ?? "Package not found");

  if (pkgState.loading) {
    return (
      <div className="container-x">
        <LoadingState label="Loading package…" />
      </div>
    );
  }

  if (!pkg) {
    const notFound = (pkgState.error ?? "").toLowerCase().includes("not found");
    if (notFound) {
      return (
        <div className="container-x flex flex-col items-center py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Package not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This health package isn't in the catalogue.
          </p>
          <Button to="/packages" className="mt-6">
            Browse all packages
          </Button>
        </div>
      );
    }
    return (
      <div className="container-x py-12">
        <ErrorState message={pkgState.error ?? "Something went wrong"} onRetry={pkgState.refetch} />
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-slate-200/70 bg-slate-50">
        <div className="container-x py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link to="/" className="transition-colors hover:text-primary-700">
              Home
            </Link>
            <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
            <Link to="/packages" className="transition-colors hover:text-primary-700">
              Health Packages
            </Link>
            <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
            <span className="truncate font-medium text-slate-900">{pkg.name}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-600 text-white shadow-float">
              <FlaskConical className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {pkg.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <Badge variant="neutral">{pkg.testsCount} tests</Badge>
                {pkg.homeCollection && <Badge variant="success">Home collection</Badge>}
                {pkg.popular && <Badge variant="warning">Most popular</Badge>}
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{pkg.description}</p>
        </div>
      </div>

      <div className="container-x grid gap-8 py-10 sm:py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {pkg.highlights && pkg.highlights.length > 0 && (
            <section aria-label="Package highlights">
              <h2 className="text-lg font-semibold text-slate-900">Highlights</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {pkg.highlights.map((h) => (
                  <li key={h} className="card flex items-center gap-2.5 p-4 text-sm font-medium text-slate-700">
                    <Sparkles className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pkg.includedTests && pkg.includedTests.length > 0 && (
            <section aria-label="What's included" className="mt-10">
              <h2 className="text-lg font-semibold text-slate-900">What's included</h2>
              <p className="mt-1 text-xs text-slate-400">
                Sample parameters shown — the full test list is finalised at booking.
              </p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {pkg.includedTests.map((name) => (
                  <li key={name} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <CircleCheck className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
                    {name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <p className="text-xs font-medium text-slate-500">Starting from</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{formatINR(pkg.startingPrice)}</p>
            <p className="mt-1 text-xs text-slate-400">for {pkg.testsCount} tests with home collection</p>

            <Button fullWidth size="lg" className="mt-6" onClick={() => setBookingOpen(true)}>
              Book This Package
            </Button>
            <Button to="/tests" variant="ghost" fullWidth className="mt-2">
              Browse individual tests
            </Button>

            <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <li>• One transparent price for the whole package</li>
              <li>• Home sample collection available</li>
              <li>• Single digital report for all parameters</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="container-x pb-12">
        <Link
          to="/packages"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all packages
        </Link>
      </div>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        itemLabel={pkg.name}
        price={formatINR(pkg.startingPrice)}
      />
    </>
  );
}
