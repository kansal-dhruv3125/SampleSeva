import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  Clock,
  Droplets,
  House,
  SearchX,
  Star,
} from "lucide-react";
import { formatINR } from "../data";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DemoNotice } from "../components/ui/DemoNotice";
import { LoadingState, ErrorState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { fetchTestBySlug, fetchTestOfferings } from "../lib/api";

type SortOption = "price-asc" | "price-desc" | "report-time" | "rating" | "home-first";

export function TestDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const testState = useApi(
    () => (slug ? fetchTestBySlug(slug) : Promise.reject(new Error("Test not found"))),
    [slug],
  );
  const offeringsState = useApi(
    () => (slug ? fetchTestOfferings(slug) : Promise.reject(new Error("Test not found"))),
    [slug],
  );

  const test = testState.data;
  usePageTitle(test?.name ?? "Test not found");

  const comparisonRows = useMemo(() => {
    const rows = (offeringsState.data ?? []).map((offering) => ({ lab: offering.lab, offering }));

    return rows.filter((row) => {
      const matchesHomeCollection =
        !homeCollectionOnly ||
        row.offering.homeCollectionAvailability === "available" ||
        row.offering.homeCollectionAvailability === "lab-dependent";
      const matchesAvailable = !showAvailableOnly || row.offering.available;
      const matchesPrice = maxPrice === undefined || row.offering.price <= maxPrice;
      return matchesHomeCollection && matchesAvailable && matchesPrice;
    });
  }, [homeCollectionOnly, maxPrice, showAvailableOnly, offeringsState.data]);

  const sortedComparisonRows = useMemo(() => {
    const rows = [...comparisonRows];
    const timeOrder: Record<string, number> = {
      "2 hours": 0,
      "Same day": 1,
      "12 hours": 2,
      "24 hours": 3,
      "48 hours": 4,
    };

    rows.sort((a, b) => {
      if (sortBy === "price-desc") {
        return b.offering.price - a.offering.price;
      }
      if (sortBy === "report-time") {
        return (timeOrder[String(a.offering.reportTime)] ?? 99) - (timeOrder[String(b.offering.reportTime)] ?? 99);
      }
      if (sortBy === "rating") {
        return b.lab.rating - a.lab.rating;
      }
      if (sortBy === "home-first") {
        const aHome = a.offering.homeCollectionAvailability === "available" ? 0 : 1;
        const bHome = b.offering.homeCollectionAvailability === "available" ? 0 : 1;
        if (aHome !== bHome) return aHome - bHome;
        return a.offering.price - b.offering.price;
      }
      return a.offering.price - b.offering.price;
    });

    return rows;
  }, [comparisonRows, sortBy]);

  if (testState.loading) {
    return (
      <div className="container-x">
        <LoadingState label="Loading test details…" />
      </div>
    );
  }

  if (!test) {
    const notFound = (testState.error ?? "").toLowerCase().includes("not found");
    if (notFound) {
      return (
        <div className="container-x flex flex-col items-center py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Test not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            The test you're looking for isn't in the catalogue.
          </p>
          <Button to="/tests" className="mt-6">
            Browse all tests
          </Button>
        </div>
      );
    }
    return (
      <div className="container-x py-12">
        <ErrorState message={testState.error ?? "Something went wrong"} onRetry={testState.refetch} />
      </div>
    );
  }

  const homeCollection =
    test.homeCollection ??
    (test.homeCollectionAvailable === "available" || test.homeCollectionAvailable === "lab-dependent");
  const fastingValue =
    test.fasting ??
    (test.fastingRequired ? `Fast${test.fastingHours ? ` for ${test.fastingHours} hours` : " as directed"}` : "Not specified");
  const reportValue =
    typeof test.reportTime === "string" ? test.reportTime : test.reportTime ? `${test.reportTime}` : "Varies by lab";
  const preparation = test.preparation ?? test.preparationInstructions ?? [];
  const startingPrice = test.startingPrice ?? test.priceFrom ?? 0;

  const facts = [
    { icon: Droplets, label: "Sample type", value: test.sampleType },
    { icon: Clock, label: "Fasting", value: fastingValue },
    { icon: CalendarClock, label: "Report time", value: reportValue },
    { icon: House, label: "Collection", value: homeCollection ? "Home collection available" : "Walk-in only" },
  ];

  return (
    <>
      <div className="border-b border-slate-200/70 bg-slate-50">
        <div className="container-x py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link to="/" className="transition-colors hover:text-primary-700">
              Home
            </Link>
            <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
            <Link to="/tests" className="transition-colors hover:text-primary-700">
              Tests
            </Link>
            <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
            <span className="truncate font-medium text-slate-900">{test.name}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {test.name}
            </h1>
            {homeCollection && <Badge variant="success">Home collection</Badge>}
            {test.popular && <Badge variant="warning">Popular</Badge>}
          </div>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            {test.description}
          </p>
        </div>
      </div>

      <div className="container-x grid gap-8 py-10 sm:py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section aria-label="Test details">
            <h2 className="text-lg font-semibold text-slate-900">Key details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="card p-4">
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <fact.icon className="size-4 text-primary-600" aria-hidden="true" />
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-900">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {preparation.length > 0 && (
            <section aria-label="Preparation" className="mt-10">
              <h2 className="text-lg font-semibold text-slate-900">Before your test</h2>
              <ul className="mt-4 space-y-2.5">
                {preparation.map((item: string) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Compare labs" className="mt-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Compare labs</h2>
              <Link
                to="/labs"
                className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800"
              >
                View all labs
              </Link>
            </div>
            <div className="mt-3">
              <DemoNotice />
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                aria-label="Sort lab comparisons"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="report-time">Fastest Report</option>
                <option value="rating">Highest Rated</option>
                <option value="home-first">Home Collection First</option>
              </select>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={homeCollectionOnly}
                  onChange={(e) => setHomeCollectionOnly(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Home collection
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Available only
              </label>

              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span>Price ≤</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={maxPrice ?? ""}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Any"
                  className="w-24 rounded-xl border border-slate-300 bg-white px-2 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                />
              </div>
            </div>

            {offeringsState.loading ? (
              <LoadingState label="Loading lab comparisons…" className="py-10" />
            ) : offeringsState.error ? (
              <ErrorState message={offeringsState.error} onRetry={offeringsState.refetch} className="mt-4" />
            ) : sortedComparisonRows.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <SearchX className="mx-auto size-8 text-slate-400" aria-hidden="true" />
                <p className="mt-3 font-medium text-slate-900">No lab matches these filters</p>
                <p className="mt-1 text-sm text-slate-600">Try widening your price or availability settings.</p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {sortedComparisonRows.map(({ lab, offering }) => {
                  const homeLabel =
                    offering.homeCollectionAvailability === "available"
                      ? "Home collection"
                      : offering.homeCollectionAvailability === "lab-dependent"
                        ? "Lab-dependent"
                        : "Walk-in only";

                  return (
                    <li key={offering.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-900">{lab.name}</p>
                          {offering.available ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="neutral">Unavailable</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{lab.city} · {lab.area}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                            {lab.rating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>{homeLabel}</span>
                          <span>•</span>
                          <span>{offering.reportTime}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <div className="text-left sm:text-right">
                          <p className="text-xl font-extrabold text-primary-700">{formatINR(offering.price)}</p>
                          {offering.collectionFee ? (
                            <p className="text-xs text-slate-500">+ {formatINR(offering.collectionFee)} collection fee</p>
                          ) : null}
                        </div>
                        <Button to={`/book/${test.slug}/${lab.slug}`} size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <p className="text-xs font-medium text-slate-500">Starting from</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {formatINR(startingPrice)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Inclusive of home collection, if selected</p>

            <Button
              fullWidth
              size="lg"
              className="mt-6"
              to={sortedComparisonRows[0] ? `/book/${test.slug}/${sortedComparisonRows[0].lab.slug}` : `/book/${test.slug}`}
            >
              Book This Test
            </Button>
            <Button to="/packages" variant="ghost" fullWidth className="mt-2">
              Explore health packages
            </Button>

            <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <li>• Transparent starting price</li>
              <li>• Home sample collection available</li>
              <li>• Digital report delivery</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="container-x pb-12">
        <Link
          to="/tests"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all tests
        </Link>
      </div>

    </>
  );
}
