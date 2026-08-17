import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { SearchBar } from "../components/search/SearchBar";
import { TestCard } from "../components/cards/TestCard";
import { PackageCard } from "../components/cards/PackageCard";
import { PageHeader } from "../components/ui/PageHeader";
import { DemoNotice } from "../components/ui/DemoNotice";
import { Button } from "../components/ui/Button";
import { LoadingState, ErrorState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { fetchCategories, fetchPackages, fetchTests } from "../lib/api";
import { cn } from "../lib/utils";

export function TestsPage() {
  usePageTitle("Browse Tests");
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category") ?? "";
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const categoriesState = useApi(fetchCategories, []);
  const testsState = useApi(
    () => fetchTests({ category: categoryId || undefined, q: query.trim() || undefined, limit: 200 }),
    [categoryId, query],
  );
  const packagesState = useApi(() => fetchPackages(categoryId || undefined), [categoryId]);

  const categories = categoriesState.data ?? [];
  const activeCategory = categories.find((c) => c.id === categoryId) ?? null;
  const filteredTests = testsState.data?.items ?? [];
  const totalTests = testsState.data?.total ?? 0;

  const setCategory = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("category", id);
    else next.delete("category");
    setSearchParams(next, { replace: true });
  };

  const setQueryParam = (q: string) => {
    setQuery(q);
    const next = new URLSearchParams(searchParams);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const categoryPackages = packagesState.data ?? [];
  const showPackages = categoryPackages.length > 0 && filteredTests.length === 0;

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Browse Tests"
        subtitle="Every test with transparent starting prices, sample details and home collection availability."
      >
        <div className="max-w-2xl">
          <SearchBar
            size="md"
            value={query}
            onValueChange={setQueryParam}
            placeholder="Search for a test, package or health checkup..."
          />
        </div>
      </PageHeader>

      <div className="container-x py-10 sm:py-12">
        <DemoNotice className="mb-8" />

        {/* Category filter chips */}
        <div
          role="group"
          aria-label="Filter tests by category"
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
          <button
            type="button"
            onClick={() => setCategory("")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              !categoryId
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700",
            )}
          >
            All tests
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              aria-pressed={categoryId === cat.id}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                categoryId === cat.id
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {!testsState.loading && !testsState.error && (
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500">
              {activeCategory ? (
                <>
                  {activeCategory.name} · <span className="text-slate-900">{filteredTests.length}</span> test
                  {filteredTests.length === 1 ? "" : "s"}
                </>
              ) : (
                <>
                  Showing <span className="text-slate-900">{filteredTests.length}</span> of {totalTests} tests
                </>
              )}
            </h2>
          </div>
        )}

        {testsState.loading ? (
          <LoadingState label="Loading tests…" className="mt-4" />
        ) : testsState.error ? (
          <ErrorState message={testsState.error} onRetry={testsState.refetch} className="mt-4" />
        ) : filteredTests.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : showPackages ? (
          <div className="mt-6">
            <p className="mb-5 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
              This category is served through health packages. Here's what's available:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {categoryPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <SearchX className="size-10 text-slate-300" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No tests found</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              We couldn't find anything matching your search. Try a different term or browse the
              full catalogue.
            </p>
            <Button
              className="mt-6"
              onClick={() => {
                setQueryParam("");
                setCategory("");
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
