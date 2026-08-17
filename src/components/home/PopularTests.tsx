import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TestCard } from "../cards/TestCard";
import { SectionHeading } from "../ui/SectionHeading";
import { LoadingState, ErrorState } from "../ui/AsyncState";
import { useApi } from "../../hooks/useApi";
import { fetchTests } from "../../lib/api";

export function PopularTests() {
  const state = useApi(() => fetchTests({ popular: true }), []);

  return (
    <section aria-label="Popular tests" className="bg-slate-50">
      <div className="container-x section-pad">
        <SectionHeading
          eyebrow="Most booked"
          title="Popular Tests"
          subtitle="The tests Indians book most often — with transparent starting prices and home collection."
          action={
            <Link
              to="/tests"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800"
            >
              View all tests
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        {state.loading ? (
          <LoadingState label="Loading popular tests…" className="py-10" />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.refetch} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {(state.data?.items ?? []).map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
