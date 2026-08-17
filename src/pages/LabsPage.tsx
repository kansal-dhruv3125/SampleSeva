import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import { LabCard } from "../components/cards/LabCard";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { LoadingState, ErrorState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { fetchLabs } from "../lib/api";
import { cn } from "../lib/utils";

type SortOption = "highest-rated" | "most-reviews" | "most-tests" | "name-asc";

export function LabsPage() {
  usePageTitle("Diagnostic Labs");
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city") ?? "";
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("highest-rated");
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);

  const labsState = useApi(() => fetchLabs({ limit: 200 }), []);
  const labs = labsState.data?.items ?? [];
  const cities = useMemo(() => [...new Set(labs.map((l) => l.city))].sort(), [labs]);

  const setCity = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set("city", next);
    else params.delete("city");
    setSearchParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = labs
      .map((lab) => ({
        lab,
        testCount: lab.testsOffered ?? 0,
      }))
      .filter(({ lab }) => {
        const matchesCity = !city || lab.city.toLowerCase() === city.toLowerCase();
        const matchesQuery =
          !q ||
          lab.name.toLowerCase().includes(q) ||
          lab.city.toLowerCase().includes(q) ||
          lab.area.toLowerCase().includes(q);
        const matchesHomeCollection = !homeCollectionOnly || lab.homeCollection;

        return matchesCity && matchesQuery && matchesHomeCollection;
      });

    list.sort((a, b) => {
      if (sortBy === "most-reviews") {
        return b.lab.reviewCount - a.lab.reviewCount;
      }
      if (sortBy === "most-tests") {
        return b.testCount - a.testCount;
      }
      if (sortBy === "name-asc") {
        return a.lab.name.localeCompare(b.lab.name);
      }
      return b.lab.rating - a.lab.rating;
    });

    return list.map(({ lab }) => lab);
  }, [city, homeCollectionOnly, query, sortBy, labs]);

  return (
    <>
      <PageHeader
        eyebrow="Labs"
        title="Diagnostic Labs Near You"
        subtitle="Compare demo laboratories by rating, distance, price and home collection availability."
      />

      <div className="container-x py-10 sm:py-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div role="group" aria-label="Filter labs by city" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setCity("")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                !city ? "border-primary-600 bg-primary-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700",
              )}
            >
              All cities
            </button>
            {cities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                aria-pressed={city === c}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  city === c ? "border-primary-600 bg-primary-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="lab-search" className="sr-only">
                Search labs
              </label>
              <input
                id="lab-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lab, city or area"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
              aria-label="Sort labs"
            >
              <option value="highest-rated">Highest Rated</option>
              <option value="most-reviews">Most Reviews</option>
              <option value="most-tests">Most Tests</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {labs.length} labs
            {city && (
              <>
                {" "}in <span className="font-semibold text-slate-900">{city}</span>
              </>
            )}
          </p>

          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={homeCollectionOnly}
              onChange={(e) => setHomeCollectionOnly(e.target.checked)}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            Home collection
          </label>
        </div>

        {labsState.loading ? (
          <LoadingState label="Loading labs…" className="mt-2" />
        ) : labsState.error ? (
          <ErrorState message={labsState.error} onRetry={labsState.refetch} className="mt-2" />
        ) : filtered.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {filtered.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <SearchX className="size-10 text-slate-300" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No labs found</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              No labs match your search. Try a different city or clear the filters.
            </p>
            <Button
              className="mt-6"
              onClick={() => {
                setQuery("");
                setCity("");
                setHomeCollectionOnly(false);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
