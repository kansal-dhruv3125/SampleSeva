import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  Home,
  MapPin,
  Phone,
  Search,
  SearchX,
  Star,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DemoNotice } from "../components/ui/DemoNotice";
import { LoadingState, ErrorState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { formatINR } from "../data";
import { fetchLabBySlug, fetchLabOfferings } from "../lib/api";

type SortOption = "price-asc" | "price-desc" | "report-time" | "rating" | "home-first";

export function LabDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [query, setQuery] = useState("");
  const [showHomeOnly, setShowHomeOnly] = useState(false);

  const labState = useApi(
    () => (slug ? fetchLabBySlug(slug) : Promise.reject(new Error("Lab not found"))),
    [slug],
  );
  const offeringsState = useApi(
    () => (slug ? fetchLabOfferings(slug) : Promise.reject(new Error("Lab not found"))),
    [slug],
  );

  const lab = labState.data;
  usePageTitle(lab?.name ?? "Lab Details");

  const offeringsWithTests = useMemo(
    () => (offeringsState.data ?? []).map((offering) => ({ offering, test: offering.test })),
    [offeringsState.data],
  );

  // Apply filters and sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = offeringsWithTests.filter((item) => {
      // Text search
      const matchesQuery =
        !q ||
        item.test.name.toLowerCase().includes(q) ||
        item.test.id.toLowerCase().includes(q);

      // Home collection filter
      const matchesHomeOnly =
        !showHomeOnly || item.offering.homeCollectionAvailability === "available";

      return matchesQuery && matchesHomeOnly;
    });

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.offering.price - b.offering.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.offering.price - a.offering.price);
    } else if (sortBy === "report-time") {
      const timeOrder: Record<string, number> = {
        "2 hours": 0,
        "4 hours": 1,
        "12 hours": 2,
        "Same day": 3,
        "24 hours": 4,
        "48 hours": 5,
      };
      result.sort(
        (a, b) =>
          (timeOrder[a.offering.reportTime] ?? 999) -
          (timeOrder[b.offering.reportTime] ?? 999),
      );
    } else if (sortBy === "rating") {
      // Sort by lab rating (all items same rating, so just alphabetical)
      result.sort((a, b) => a.test.name.localeCompare(b.test.name));
    } else if (sortBy === "home-first") {
      result.sort((a, b) => {
        const aHome = a.offering.homeCollectionAvailability === "available" ? 0 : 1;
        const bHome = b.offering.homeCollectionAvailability === "available" ? 0 : 1;
        if (aHome !== bHome) return aHome - bHome;
        return a.offering.price - b.offering.price;
      });
    }

    return result;
  }, [query, showHomeOnly, sortBy, offeringsWithTests]);

  if (labState.loading) {
    return (
      <div className="container-x">
        <LoadingState label="Loading lab details…" />
      </div>
    );
  }

  if (!lab) {
    const notFound = (labState.error ?? "").toLowerCase().includes("not found");
    if (notFound) {
      return (
        <div className="container-x py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Lab not found</h1>
          <p className="mt-2 text-slate-600">
            The laboratory you're looking for doesn't exist.
          </p>
        </div>
      );
    }
    return (
      <div className="container-x py-12">
        <ErrorState message={labState.error ?? "Something went wrong"} onRetry={labState.refetch} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Lab Details"
        title={lab.name}
        subtitle={lab.description}
      />

      <div className="container-x py-10 sm:py-12">
        <DemoNotice />

        {/* Lab Info Grid */}
        <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <MapPin className="size-4" aria-hidden="true" />
              Location
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">{lab.area}</p>
            <p className="text-xs text-slate-600">{lab.address}</p>
            <p className="text-xs text-slate-600">{lab.city}, {lab.pincode}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              Rating
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {lab.rating.toFixed(1)} ★
            </p>
            <p className="text-xs text-slate-600">
              {lab.reviewCount.toLocaleString("en-IN")} reviews
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Phone className="size-4" aria-hidden="true" />
              Contact
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">{lab.phone}</p>
            <p className="text-xs text-slate-600">{lab.email}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Clock className="size-4" aria-hidden="true" />
              Hours
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {lab.openingHours}
            </p>
            <p className="text-xs text-slate-600">
              {lab.verified ? "✓ Verified" : "Not verified"}
            </p>
          </div>

          {lab.homeCollection && (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Home className="size-4" aria-hidden="true" />
                Home Collection
              </h3>
              <p className="mt-2 text-sm font-medium text-emerald-700">Available</p>
            </div>
          )}

          {lab.services && lab.services.length > 0 && (
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Stethoscope className="size-4" aria-hidden="true" />
                Specializations
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {lab.services.map((service) => (
                  <Badge key={service} variant="info">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tests Section */}
        <div className="mt-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Available Tests
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {filtered.length} of {offeringsWithTests.length} tests
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:border-slate-400"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="report-time">Fastest Report</option>
                <option value="rating">Highest Rated</option>
                <option value="home-first">Home Collection First</option>
              </select>

              {/* Home Collection Filter */}
              <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 hover:border-slate-400">
                <input
                  type="checkbox"
                  checked={showHomeOnly}
                  onChange={(e) => setShowHomeOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-900">
                  Home collection
                </span>
              </label>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search tests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Tests List */}
          {offeringsState.loading ? (
            <LoadingState label="Loading tests…" className="py-10" />
          ) : offeringsState.error ? (
            <ErrorState message={offeringsState.error} onRetry={offeringsState.refetch} />
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <SearchX className="mx-auto size-8 text-slate-400" aria-hidden="true" />
              <p className="mt-2 font-medium text-slate-900">No tests found</p>
              <p className="text-sm text-slate-600">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(({ offering, test }) => (
                <div
                  key={offering.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900">{test.name}</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="neutral" className="text-xs">
                        <Clock className="size-3" aria-hidden="true" />
                        {offering.reportTime}
                      </Badge>
                      {offering.homeCollectionAvailability === "available" && (
                        <Badge variant="success" className="text-xs">
                          <Home className="size-3" aria-hidden="true" />
                          Home collection
                        </Badge>
                      )}
                      {offering.homeCollectionAvailability === "lab-dependent" && (
                        <Badge variant="info" className="text-xs">
                          <Home className="size-3" aria-hidden="true" />
                          Lab-dependent
                        </Badge>
                      )}
                      {offering.discountPercentage && (
                        <Badge variant="success" className="text-xs">
                          {offering.discountPercentage}% off
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {formatINR(offering.price)}
                      </p>
                      {offering.collectionFee && (
                        <p className="text-xs text-slate-600">
                          + {formatINR(offering.collectionFee)} collection fee
                        </p>
                      )}
                    </div>
                    <Button size="sm" className="w-full sm:w-auto">
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
