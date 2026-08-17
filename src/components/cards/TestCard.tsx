import { Link } from "react-router-dom";
import { ArrowRight, Clock, Droplets } from "lucide-react";
import type { Test } from "../../types";
import { formatINR } from "../../data";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

export function TestCard({ test, className }: { test: Test; className?: string }) {
  const homeCollection =
    test.homeCollection ??
    (test.homeCollectionAvailable === "available" || test.homeCollectionAvailable === "lab-dependent");
  const reportTime = typeof test.reportTime === "string" ? test.reportTime : `${test.reportTime}`;
  const startingPrice = test.startingPrice ?? test.priceFrom ?? 0;

  return (
    <Link
      to={`/tests/${test.slug}`}
      className={cn("card card-hover group flex flex-col p-5", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary-800">
          {test.name}
        </h3>
        {homeCollection && <Badge variant="success">Home collection</Badge>}
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{test.description}</p>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Sample type</dt>
          <Droplets className="size-3.5 text-slate-400" aria-hidden="true" />
          <dd>{test.sampleType}</dd>
        </div>
        {reportTime && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Report time</dt>
            <Clock className="size-3.5 text-slate-400" aria-hidden="true" />
            <dd>{reportTime}</dd>
          </div>
        )}
      </dl>

      <div className="mt-auto flex items-end justify-between pt-5">
        <div>
          <p className="text-xs text-slate-500">Starting from</p>
          <p className="text-lg font-bold text-slate-900">{formatINR(startingPrice)}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors group-hover:text-primary-800">
          View Details
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
