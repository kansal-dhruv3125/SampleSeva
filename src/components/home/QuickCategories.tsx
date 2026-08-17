import { CategoryCard } from "../cards/CategoryCard";
import { SectionHeading } from "../ui/SectionHeading";
import { LoadingState, ErrorState } from "../ui/AsyncState";
import { useApi } from "../../hooks/useApi";
import { fetchCategories } from "../../lib/api";

export function QuickCategories() {
  const state = useApi(fetchCategories, []);

  return (
    <section aria-label="Browse by category" className="container-x section-pad">
      <SectionHeading
        eyebrow="Categories"
        title="Browse by category"
        subtitle="Find the right test quickly — every category links to a filtered catalogue."
      />
      {state.loading ? (
        <LoadingState label="Loading categories…" className="py-10" />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={state.refetch} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {(state.data ?? []).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}
