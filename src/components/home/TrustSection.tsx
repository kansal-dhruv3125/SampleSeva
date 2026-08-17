import { CircleCheck } from "lucide-react";
import { Button } from "../ui/Button";

const TRUST_ITEMS = [
  "Easy online booking",
  "Transparent test information",
  "Convenient collection scheduling",
  "Digital booking records",
  "Multiple laboratory options",
];

export function TrustSection() {
  return (
    <section aria-label="Your health deserves convenience" className="bg-primary-50/60">
      <div className="container-x section-pad">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-600">
              Our promise
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your Health Deserves Convenience.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
              Getting tested should never mean long queues or unclear costs. SampleSeva brings the
              entire journey — discovery, comparison and scheduling — to your phone, so you can
              focus on your health, not the logistics.
            </p>
            <Button to="/how-it-works" variant="secondary" className="mt-7">
              See how it works
            </Button>
          </div>

          <ul className="card p-6 sm:p-8">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 border-b border-slate-100 py-3.5 last:border-b-0"
              >
                <CircleCheck className="size-5 shrink-0 text-primary-600" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
