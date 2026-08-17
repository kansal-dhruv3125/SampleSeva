import { Link } from "react-router-dom";
import {
  ClipboardList,
  Dna,
  Droplets,
  FlaskConical,
  ListFilter,
  Flower,
  Gauge,
  HeartPulse,
  Pill,
  Shield,
  Syringe,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "../../types";
import { packagesByCategory, testsByCategory } from "../../data";
import { cn } from "../../lib/utils";

const ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  flask: FlaskConical,
  syringe: Syringe,
  gauge: Gauge,
  pill: Pill,
  dna: Dna,
  shield: Shield,
  filter: ListFilter,
  "heart-pulse": HeartPulse,
  flower: Flower,
  user: User,
  clipboard: ClipboardList,
};

export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const Icon = ICONS[category.icon] ?? FlaskConical;
  // Prefer backend-computed counts (Phase 5F); fall back to the demo data
  // layer when the API didn't provide them (e.g. demo-only contexts).
  const testCount = category.testCount ?? testsByCategory(category.id).length;
  const packageCount = category.packageCount ?? packagesByCategory(category.id).length;
  const countLabel = testCount > 0 ? `${testCount} test${testCount === 1 ? "" : "s"}` : `${packageCount} packages`;

  return (
    <Link
      to={`/tests?category=${category.id}`}
      className={cn(
        "card card-hover group flex items-center gap-4 p-4",
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-primary-800">
          {category.name}
        </span>
        <span className="block truncate text-xs text-slate-500">{countLabel}</span>
      </span>
    </Link>
  );
}
