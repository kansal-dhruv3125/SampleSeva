import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "success" | "info" | "neutral" | "warning";

const variantClasses: Record<Variant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/10",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
