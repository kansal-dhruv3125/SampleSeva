import { ArrowLeftRight, ClipboardCheck, Search, Truck } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";

const STEPS = [
  {
    icon: Search,
    title: "Search Your Test",
    description: "Find the test or health package you need from our transparent catalogue.",
  },
  {
    icon: ArrowLeftRight,
    title: "Compare Labs & Prices",
    description: "See starting prices from multiple labs and pick the best fit for you.",
  },
  {
    icon: Truck,
    title: "Choose Home Collection",
    description: "Pick a date and time slot that suits you — a phlebotomist visits your home.",
  },
  {
    icon: ClipboardCheck,
    title: "Get Tested & Receive Your Report",
    description: "Your sample is collected at home and your report is delivered digitally.",
  },
];

export function HowItWorks() {
  return (
    <section aria-label="How SampleSeva works" className="bg-slate-50">
      <div className="container-x section-pad">
        <SectionHeading
          eyebrow="How it works"
          title="From search to report in 4 simple steps"
          subtitle="Booking a diagnostic test at home has never been this straightforward."
          align="center"
        />
        <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Connector line (desktop) */}
          <div
            className="absolute left-0 right-0 top-9 hidden border-t-2 border-dashed border-primary-200 lg:block"
            aria-hidden="true"
          />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="card h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="relative grid size-11 place-items-center rounded-xl bg-white text-primary-600 ring-1 ring-primary-200 shadow-card">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-extrabold tracking-tight text-slate-100">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
