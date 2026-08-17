import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search, SearchX } from "lucide-react";
import { locations } from "../../data";
import { SectionHeading } from "../ui/SectionHeading";

export function LocationSection() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) => loc.name.toLowerCase().includes(q) || loc.region.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section aria-label="Find labs near you" className="container-x section-pad">
      <SectionHeading
        eyebrow="Locations"
        title="Find Diagnostic Labs Near You"
        subtitle="SampleSeva is expanding city by city. Enter your area to see what's available."
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <label htmlFor="location-search" className="sr-only">
          Search your city
        </label>
        <input
          id="location-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your city, e.g. Chandigarh"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <SearchX className="size-8 text-slate-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-slate-700">No locations match "{query}"</p>
          <p className="mt-1 text-sm text-slate-500">
            We're expanding soon — check back or explore the demo labs we have today.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((loc) => (
            <Link
              key={loc.id}
              to={`/labs?city=${encodeURIComponent(loc.name.toLowerCase())}`}
              className="card card-hover group flex items-center gap-4 p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-slate-900 group-hover:text-primary-800">
                  {loc.name}
                </span>
                <span className="block text-xs text-slate-500">
                  {loc.region} · {loc.labCount} demo {loc.labCount === 1 ? "lab" : "labs"}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Demo locations only — live city coverage and map integration arrive in Phase 2.
      </p>
    </section>
  );
}
