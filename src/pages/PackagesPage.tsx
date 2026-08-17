import { PackageCard } from "../components/cards/PackageCard";
import { PageHeader } from "../components/ui/PageHeader";
import { DemoNotice } from "../components/ui/DemoNotice";
import { LoadingState, ErrorState } from "../components/ui/AsyncState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { fetchPackages } from "../lib/api";

export function PackagesPage() {
  usePageTitle("Health Packages");
  const state = useApi(fetchPackages, []);

  return (
    <>
      <PageHeader
        eyebrow="Health packages"
        title="Preventive Health Packages"
        subtitle="Curated combinations of tests at a single transparent price — ideal for annual checkups and ongoing health monitoring."
      />
      <div className="container-x py-10 sm:py-12">
        <DemoNotice className="mb-8" />
        {state.loading ? (
          <LoadingState label="Loading packages…" />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.refetch} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {(state.data ?? []).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
