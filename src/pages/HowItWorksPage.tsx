import { ArrowLeftRight, ClipboardCheck, MapPin, Search, Truck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeading } from "../components/ui/SectionHeading";
import { usePageTitle } from "../hooks/usePageTitle";

const STEPS = [
  {
    icon: Search,
    title: "Search Your Test",
    description:
      "Browse our catalogue of individual tests and health packages, or search by name — CBC, Vitamin D, Thyroid Profile and more.",
    detail: "Every listing shows the sample type, starting price and whether home collection is available.",
  },
  {
    icon: ArrowLeftRight,
    title: "Compare Labs & Prices",
    description:
      "See starting prices from multiple diagnostic labs side by side so you can make an informed choice.",
    detail: "In Phase 2 you'll be able to filter by rating, distance, price and report turnaround time.",
  },
  {
    icon: Truck,
    title: "Choose Home Collection",
    description:
      "Pick a date and a time slot that suits you. A phlebotomist visits your home to collect the sample.",
    detail: "Prefer to visit a lab? Walk-in collection is also available for selected labs.",
  },
  {
    icon: ClipboardCheck,
    title: "Get Tested & Receive Your Report",
    description:
      "Your sample is processed by the lab and your report is delivered digitally, in one place.",
    detail: "Booking records and reports will live in your SampleSeva account from Phase 2 onwards.",
  },
];

const EXPECTATIONS = [
  "No prepayment needed to browse — prices are shown upfront",
  "Choose slots from early morning to evening",
  "Get a confirmation with your collection window",
  "Track your booking and report status digitally",
];

export function HowItWorksPage() {
  usePageTitle("How It Works");

  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From search to report, in 4 steps"
        subtitle="SampleSeva makes booking a diagnostic test as easy as ordering food — except it's for your health."
      />

      <div className="container-x section-pad">
        <ol className="space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="card p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
                <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                    <step.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-extrabold tracking-tight text-slate-300">
                    Step {index + 1}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
                  <p className="mt-2 max-w-2xl leading-relaxed text-slate-600">{step.description}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{step.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <section aria-label="What to expect" className="bg-slate-50">
        <div className="container-x section-pad">
          <SectionHeading
            eyebrow="What to expect"
            title="A simple, transparent experience"
            align="center"
          />
          <ul className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {EXPECTATIONS.map((item) => (
              <li key={item} className="card flex items-center gap-3 p-4 text-sm font-medium text-slate-700">
                <MapPin className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Button to="/tests" size="lg">
              Find a Test
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
