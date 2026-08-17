import { Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Page Not Found");

  return (
    <div className="container-x flex flex-col items-center py-24 text-center sm:py-32">
      <span className="grid size-16 place-items-center rounded-2xl bg-primary-50 text-primary-600">
        <Search className="size-8" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        This page couldn't be found
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
        The page you're looking for doesn't exist or has moved. Let's get you back to your health
        journey.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/" size="lg">
          Back to Home
        </Button>
        <Button to="/tests" variant="secondary" size="lg">
          Browse Tests
        </Button>
      </div>
    </div>
  );
}
