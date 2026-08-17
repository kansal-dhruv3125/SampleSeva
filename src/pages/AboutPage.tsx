import { Building2, HeartHandshake, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeading } from "../components/ui/SectionHeading";
import { usePageTitle } from "../hooks/usePageTitle";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Transparency first",
    description: "Clear prices, clear information, and no hidden surprises at any step.",
  },
  {
    icon: HeartHandshake,
    title: "Patient-centric",
    description: "Every decision starts with what makes testing easier and more dignified for you.",
  },
  {
    icon: Leaf,
    title: "Simple by design",
    description: "We remove friction — from discovery to scheduling — so health stays the focus.",
  },
  {
    icon: Building2,
    title: "Lab-friendly",
    description: "We build tools that help diagnostic labs reach more patients, fairly.",
  },
];

export function AboutPage() {
  usePageTitle("About Us");

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Healthcare testing, from the comfort of home"
        subtitle="SampleSeva is a diagnostic laboratory test booking marketplace for India — built to make testing simple, transparent and convenient."
      />

      <section aria-label="Our mission" className="container-x section-pad">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-600">
              Our mission
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Why we're building SampleSeva
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Booking a lab test in India today usually means phone calls, unclear prices and a
              trip to the lab. We believe it should be as easy as booking a cab — search, compare,
              pick a slot, and get tested from home.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              SampleSeva connects patients with diagnostic laboratories through one clear
              marketplace: transparent starting prices, home sample collection and digital
              reports — all in a few taps.
            </p>
          </div>
          <div className="card p-6 sm:p-8">
            <p className="text-2xl font-extrabold tracking-tight text-primary-700 sm:text-3xl">
              "Your Health Deserves Convenience."
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              A simple belief that drives everything we design: testing shouldn't be the hardest
              part of taking care of your health.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Our values" className="bg-slate-50">
        <div className="container-x section-pad">
          <SectionHeading
            eyebrow="Our values"
            title="What we stand for"
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.title} className="card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  <value.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="for-labs" aria-label="For labs" className="container-x section-pad">
        <div className="relative overflow-hidden rounded-3xl border border-primary-100 bg-primary-50/70 px-6 py-12 sm:px-12">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #0d9488 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-600">
                For labs
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Partner with SampleSeva
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                We're building a fair marketplace where diagnostic labs reach more patients.
                Partnership onboarding opens in Phase 2 — tell us you're interested and we'll be in
                touch.
              </p>
            </div>
            <Button to="/contact" size="lg">
              Get in touch
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Disclaimer" className="container-x pb-14">
        <p className="max-w-3xl text-xs leading-relaxed text-slate-400">
          Disclaimer: SampleSeva is a technology platform for discovering and booking diagnostic
          laboratory services. All laboratories, tests, prices and ratings shown in this preview
          are fictional demo data. Test availability, pricing, collection requirements and report
          timelines may vary by laboratory.
        </p>
      </section>
    </>
  );
}
