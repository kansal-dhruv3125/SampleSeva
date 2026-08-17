
import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical } from "lucide-react";
import type { HealthPackage } from "../../types";
import { formatINR } from "../../data";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

export function PackageCard({ pkg, className }: { pkg: HealthPackage; className?: string }) {
  const previewTests = pkg.includedTests?.slice(0, 4) ?? [];
  const remaining = (pkg.includedTests?.length ?? 0) - previewTests.length;

  return (
    <Link
      to={`/packages/${pkg.slug}`}
      className={cn("card card-hover group flex flex-col p-5 sm:p-6", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
          <FlaskConical className="size-5" aria-hidden="true" />
        </span>
        <Badge variant="neutral">{pkg.testsCount} tests</Badge>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-primary-800">
        {pkg.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{pkg.description}</p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {previewTests.map((name) => (
          <li
            key={name}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            {name}
          </li>
        ))}
        {remaining > 0 && (
          <li className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-400">
            +{remaining} more
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-end justify-between pt-5">
        <div>
          <p className="text-xs text-slate-500">Starting from</p>
          <p className="text-lg font-bold text-slate-900">{formatINR(pkg.startingPrice)}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors group-hover:text-primary-800">
          View Package
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
