import {
  Building2,
  CalendarClock,
  Eye,
  FileText,
  House,
  IndianRupee,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";

const FEATURES: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: IndianRupee,
    title: "Compare Prices",
    description: "See prices from multiple labs side by side before you decide where to book.",
  },
  {
    icon: House,
    title: "Home Sample Collection",
    description: "A phlebotomist visits your home at the time you choose — no queues, no travel.",
  },
  {
    icon: Building2,
    title: "Multiple Labs",
    description: "Choose from a growing network of diagnostic labs in and around your city.",
  },
  {
    icon: CalendarClock,
    title: "Convenient Scheduling",
    description: "Pick a date and a time slot that fits your routine, from early morning to evening.",
  },
  {
    icon: Eye,
    title: "Transparent Pricing",
    description: "Know the total cost upfront — starting prices are shown before you book.",
  },
  {
    icon: FileText,
    title: "Digital Reports",
    description: "Receive your reports digitally, securely, in one place.",
  },
];

export function WhySampleSeva() {
  return (
    <section aria-label="Why SampleSeva" className="container-x section-pad">
      <SectionHeading
        eyebrow="Why SampleSeva"
        title="Diagnostics, minus the hassle"
        subtitle="Everything about booking a lab test should be simple, transparent and respectful of your time."
        align="center"
      />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="card card-hover p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-600">
              <feature.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
