import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export function CtaSection() {
  return (
    <section aria-label="Get started" className="container-x section-pad pt-0 sm:pt-0">
      <div className="relative overflow-hidden rounded-3xl bg-primary-700 px-6 py-14 text-center sm:px-12 sm:py-20">
        {/* Decorative elements */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -left-16 -top-20 size-64 rounded-full bg-primary-500/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-16 size-72 rounded-full bg-sky-500/30 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your next health test is just a few clicks away.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary-100 sm:text-lg">
            Search the catalogue, compare labs and prices, and schedule home sample collection —
            all from the comfort of home.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button to="/tests" variant="white" size="lg">
              Find a Test
              <ArrowRight className="size-4.5" aria-hidden="true" />
            </Button>
            <Button
              to="/how-it-works"
              size="lg"
              className="bg-transparent text-white ring-1 ring-inset ring-white/40 hover:bg-white/10"
            >
              How it works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
