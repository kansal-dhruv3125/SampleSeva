import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

/** SampleSeva brand mark: a blood drop with a heartbeat pulse. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="SampleSeva — home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-600 shadow-float">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M12 3.2c2.9 3.4 5 5.8 5 8.6a5 5 0 0 1-10 0c0-2.8 2.1-5.2 5-8.6Z"
            fill="#ffffff"
          />
          <path
            d="M9.2 12.4h2l1.2-2.8 1.7 4.9 1.2-2.1h1.9"
            fill="none"
            stroke="#0d9488"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">
        Sample<span className="text-primary-600">Seva</span>
      </span>
    </Link>
  );
}
