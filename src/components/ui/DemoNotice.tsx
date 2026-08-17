import { Info } from "lucide-react";
import { cn } from "../../lib/utils";

export function DemoNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden="true" />
      <span>
        Demo marketplace — laboratory names, prices, availability and timings shown here are simulated for development.
      </span>
    </p>
  );
}
