import type { HealthPackage } from "../types";

/**
 * Demo health packages. All prices and test counts are fictional sample data
 * for the Phase 1 UI and will come from the backend in later phases.
 */
export const packages: HealthPackage[] = [
  {
    id: "basic-full-body-checkup",
    slug: "basic-full-body-checkup",
    name: "Basic Full Body Checkup",
    testsCount: 8,
    description: "Essential screening for routine health maintenance — blood, sugar, thyroid and organ function.",
    startingPrice: 1199,
    homeCollection: true,
    popular: true,
    includedTests: ["cbc", "fbs", "lipid-profile", "liver-profile", "creatinine", "thyroid-profile", "vitamin-d-25oh", "urinalysis"],
    highlights: ["Covers key health markers", "Report in 24 hours", "Ideal annual checkup"],
  },
  {
    id: "advanced-full-body-checkup",
    slug: "advanced-full-body-checkup",
    name: "Advanced Full Body Checkup",
    testsCount: 12,
    description: "Comprehensive screening across all major organs, including cardiac and hormonal markers.",
    startingPrice: 2499,
    homeCollection: true,
    includedTests: ["cbc", "hba1c", "lipid-profile", "hs-crp", "liver-profile", "creatinine", "vitamin-b12", "vitamin-d-25oh", "troponin", "lh", "fsh", "prolactin"],
    highlights: ["12+ tests with 70+ parameters", "Cardiac & hormonal markers", "Doctor-reviewed report"],
  },
  {
    id: "diabetes-care-package",
    slug: "diabetes-care-package",
    name: "Diabetes Care Package",
    testsCount: 5,
    description: "FBS, HbA1c, lipid profile and kidney markers for monitoring and managing diabetes.",
    startingPrice: 899,
    homeCollection: true,
    includedTests: ["fbs", "hba1c", "lipid-profile", "creatinine", "urinalysis"],
    highlights: ["Quarterly monitoring", "Kidney & lipid health", "Report in 24 hours"],
  },
  {
    id: "heart-health-package",
    slug: "heart-health-package",
    name: "Heart Health Package",
    testsCount: 6,
    description: "Cardiac risk markers, lipid profile and related blood parameters for heart health.",
    startingPrice: 1499,
    homeCollection: true,
    includedTests: ["lipid-profile", "hs-crp", "fbs", "creatinine", "troponin", "ldh"],
    highlights: ["Cardiac risk assessment", "Cholesterol panel", "Doctor-reviewed report"],
  },
  {
    id: "womens-health-package",
    slug: "womens-health-package",
    name: "Women's Health Package",
    testsCount: 7,
    description: "Hormonal, thyroid, iron and bone-health screening designed for women.",
    startingPrice: 1899,
    homeCollection: true,
    includedTests: ["lh", "fsh", "estradiol", "thyroid-profile", "iron-serum", "vitamin-d-25oh", "cbc"],
    highlights: ["Hormonal balance", "Anaemia screening", "Bone health markers"],
  },
  {
    id: "mens-health-package",
    slug: "mens-health-package",
    name: "Men's Health Package",
    testsCount: 8,
    description: "Comprehensive screening for men covering metabolic, hormonal and cardiac health.",
    startingPrice: 1799,
    homeCollection: true,
    includedTests: ["cbc", "lipid-profile", "testosterone", "liver-profile", "creatinine", "vitamin-d-25oh", "hs-crp", "psa"],
    highlights: ["Metabolic & cardiac", "Liver and kidney function", "Report in 24 hours"],
  },
];

export const popularPackages: HealthPackage[] = packages.filter((p) => p.popular);

export function getPackageBySlug(slug: string): HealthPackage | undefined {
  return packages.find((p) => p.slug === slug);
}

export function packagesByCategory(categoryId: string): HealthPackage[] {
  switch (categoryId) {
    case "womens-health":
      return packages.filter((p) => p.slug === "womens-health-package");
    case "mens-health":
      return packages.filter((p) => p.slug === "mens-health-package");
    case "full-body-checkups":
      return packages.filter((p) => p.slug.includes("full-body-checkup"));
    case "diabetes":
      return packages.filter((p) => p.slug === "diabetes-care-package");
    case "heart":
      return packages.filter((p) => p.slug === "heart-health-package");
    default:
      return [];
  }
}
