import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PackageCard } from "../cards/PackageCard";
import { SectionHeading } from "../ui/SectionHeading";
import { LoadingState, ErrorState } from "../ui/AsyncState";
import { useApi } from "../../hooks/useApi";
import { fetchPackages } from "../../lib/api";

export function HealthPackages() {
  const state = useApi(fetchPackages, []);

  return (
    <section aria-label="Health packages" className="container-x section-pad">
      <SectionHeading
        eyebrow="Health packages"
        title="Preventive care, bundled"
        subtitle="Curated combinations of tests at a single transparent price — all with home collection."
        action={
          <Link
            to="/packages"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800"
          >
            View all packages
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      {state.loading ? (
        <LoadingState label="Loading packages…" className="py-10" />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={state.refetch} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {(state.data ?? []).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </section>
  );
}
