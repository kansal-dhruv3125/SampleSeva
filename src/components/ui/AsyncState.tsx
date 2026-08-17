import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

/** Simple centered loading indicator used by API-backed pages. */
export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <Loader2 className="size-8 animate-spin text-primary-600" aria-hidden="true" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
    </div>
  );
}

/** Friendly error state with an optional retry action. */
export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center",
        className,
      )}
    >
      <WifiOff className="size-10 text-slate-300" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Couldn't load data</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
