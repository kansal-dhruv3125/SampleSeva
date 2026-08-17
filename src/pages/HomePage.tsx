import { Hero } from "../components/home/Hero";
import { QuickCategories } from "../components/home/QuickCategories";
import { PopularTests } from "../components/home/PopularTests";
import { HealthPackages } from "../components/home/HealthPackages";
import { HowItWorks } from "../components/home/HowItWorks";
import { WhySampleSeva } from "../components/home/WhySampleSeva";
import { TrustSection } from "../components/home/TrustSection";
import { LocationSection } from "../components/home/LocationSection";
import { CtaSection } from "../components/home/CtaSection";
import { usePageTitle } from "../hooks/usePageTitle";

export function HomePage() {
  usePageTitle();
  return (
    <>
      <Hero />
      <QuickCategories />
      <PopularTests />
      <HealthPackages />
      <HowItWorks />
      <WhySampleSeva />
      <TrustSection />
      <LocationSection />
      <CtaSection />
    </>
  );
}
