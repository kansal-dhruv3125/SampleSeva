import type { Category } from "../types";

/**
 * Laboratory test categories. `icon` keys are resolved to Lucide icons in
 * src/components/cards/CategoryCard.tsx.
 */
export const categories: Category[] = [
  {
    id: "blood-tests",
    slug: "blood-tests",
    name: "Blood Tests",
    description: "CBC, hematology, iron studies and general blood panels",
    icon: "droplets",
    popular: true,
  },
  {
    id: "diabetes",
    slug: "diabetes",
    name: "Diabetes",
    description: "Blood sugar, HbA1c, insulin and related monitoring",
    icon: "syringe",
    popular: true,
  },
  {
    id: "thyroid",
    slug: "thyroid",
    name: "Thyroid",
    description: "TSH, T3, T4 and thyroid profiles",
    icon: "gauge",
    popular: true,
  },
  {
    id: "liver",
    slug: "liver",
    name: "Liver",
    description: "Liver enzymes, bilirubin and function panels",
    icon: "shield",
    popular: true,
  },
  {
    id: "kidney",
    slug: "kidney",
    name: "Kidney",
    description: "Creatinine, urea, electrolytes and kidney panels",
    icon: "filter",
    popular: true,
  },
  {
    id: "heart-cardiac",
    slug: "heart-cardiac",
    name: "Heart & Cardiac",
    description: "Lipid profile, cardiac markers and related investigations",
    icon: "heart-pulse",
    popular: true,
  },
  {
    id: "vitamins-minerals",
    slug: "vitamins-minerals",
    name: "Vitamins & Minerals",
    description: "Vitamin D, B12, iron, calcium and mineral panels",
    icon: "pill",
    popular: true,
  },
  {
    id: "hormones",
    slug: "hormones",
    name: "Hormones",
    description: "Reproductive, adrenal and general hormone investigations",
    icon: "dna",
  },
  {
    id: "womens-health",
    slug: "womens-health",
    name: "Women's Health",
    description: "Hormonal, pregnancy-related and women's screening tests",
    icon: "flower",
    popular: true,
  },
  {
    id: "mens-health",
    slug: "mens-health",
    name: "Men's Health",
    description: "PSA, testosterone and men's screening investigations",
    icon: "user",
  },
  {
    id: "fertility",
    slug: "fertility",
    name: "Fertility",
    description: "AMH, semen analysis and fertility-related laboratory tests",
    icon: "baby",
  },
  {
    id: "allergy",
    slug: "allergy",
    name: "Allergy",
    description: "IgE panels and allergy-related laboratory investigations",
    icon: "wind",
  },
  {
    id: "immunology",
    slug: "immunology",
    name: "Immunology",
    description: "Autoimmune markers and immunology investigations",
    icon: "shield-check",
  },
  {
    id: "infection-microbiology",
    slug: "infection-microbiology",
    name: "Infection & Microbiology",
    description: "Culture, serology and infection screening tests",
    icon: "bug",
  },
  {
    id: "urine-tests",
    slug: "urine-tests",
    name: "Urine Tests",
    description: "Urine routine, culture, protein and related tests",
    icon: "flask",
    popular: true,
  },
  {
    id: "stool-tests",
    slug: "stool-tests",
    name: "Stool Tests",
    description: "Stool routine, occult blood and related investigations",
    icon: "test-tube",
  },
  {
    id: "preventive-health",
    slug: "preventive-health",
    name: "Preventive Health",
    description: "Screening and preventive laboratory investigations",
    icon: "shield-plus",
  },
  {
    id: "full-body-checkups",
    slug: "full-body-checkups",
    name: "Full Body Health Checkups",
    description: "Comprehensive preventive packages and panels",
    icon: "clipboard",
    popular: true,
  },
  {
    id: "senior-health",
    slug: "senior-health",
    name: "Senior Health",
    description: "Screening investigations commonly used for older adults",
    icon: "users",
  },
  {
    id: "other-laboratory",
    slug: "other-laboratory",
    name: "Other Laboratory Tests",
    description: "Additional laboratory investigations outside main categories",
    icon: "more-horizontal",
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
