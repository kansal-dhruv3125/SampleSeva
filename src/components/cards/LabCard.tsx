import { House, MapPin, Star, TestTubes } from "lucide-react";
import { Link } from "react-router-dom";
import { getOfferingsForLab } from "../../data";
import type { Lab } from "../../types";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

export function LabCard({ lab, className }: { lab: Lab; className?: string }) {
  const testCount = lab.testsOffered ?? getOfferingsForLab(lab.id).length;

  return (
    <Link to={`/labs/${lab.slug}`}>
      <article className={cn("card flex flex-col p-5 sm:p-6 transition-all hover:shadow-lg hover:border-primary-300", className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">{lab.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="size-3.5 text-slate-400" aria-hidden="true" />
              {lab.city} · {lab.distanceKm ?? "Local"} km
            </p>
          </div>
          {lab.homeCollection ? (
            <Badge variant="success">Home collection</Badge>
          ) : (
            <Badge variant="neutral">Walk-in only</Badge>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{lab.description || lab.about}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <dt className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              Rating
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {lab.rating.toFixed(1)}{" "}
              <span className="font-normal text-slate-500">({lab.reviewCount.toLocaleString("en-IN")})</span>
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <dt className="flex items-center gap-1 text-xs text-slate-500">
              <TestTubes className="size-3.5 text-slate-400" aria-hidden="true" />
              Tests
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">{testCount}</dd>
          </div>
        </dl>

        <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-700">
          <House className="size-4" aria-hidden="true" />
          {lab.priceNote || "Starting at ₹199"}
        </p>
      </article>
    </Link>
  );
}
