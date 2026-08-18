import type { Test, TestAgeGroup, TestGender, HomeCollectionAvailability, SampleType } from "../../types";

type TestInput = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  description: string;
  sampleType: SampleType;
  sampleTypes?: SampleType[];
  homeCollectionAvailable: HomeCollectionAvailability;
  fastingRequired: boolean;
  fastingHours?: number;
  preparationInstructions: string[];
  reportTime: number;
  reportTimeUnit: "hours" | "days";
  reportTimeEnd?: number;
  parameters?: string[];
  priceFrom: number;
  popular?: boolean;
  gender?: TestGender;
  ageGroup?: TestAgeGroup;
  tags?: string[];
  status?: "active" | "inactive";
};

/** Normalise a demo catalogue entry with sensible defaults. */
export function defineTest(input: TestInput): Test {
  const categories = input.categories ?? [input.category];
  const sampleTypes = input.sampleTypes ?? [input.sampleType];
  if (!categories.includes(input.category)) {
    categories.unshift(input.category);
  }

  return {
    ...input,
    categories,
    sampleTypes,
    popular: input.popular ?? false,
    gender: input.gender ?? "all",
    ageGroup: input.ageGroup ?? "all",
    tags: input.tags ?? [],
    status: input.status ?? "active",
  };
}

/** Shorthand for common blood test defaults (demo catalogue). */
export function bloodTest(
  input: Omit<TestInput, "sampleType" | "sampleTypes"> & { sampleTypes?: SampleType[] },
): Test {
  return defineTest({
    ...input,
    sampleType: "Blood",
    categories: input.categories ?? [input.category, "blood-tests"],
  });
}

export function urineTest(input: Omit<TestInput, "sampleType" | "sampleTypes">): Test {
  return defineTest({
    ...input,
    sampleType: "Urine",
    categories: input.categories ?? [input.category, "urine-tests"],
  });
}

export function stoolTest(input: Omit<TestInput, "sampleType" | "sampleTypes">): Test {
  return defineTest({
    ...input,
    sampleType: "Stool",
    homeCollectionAvailable: input.homeCollectionAvailable ?? "unavailable",
    categories: input.categories ?? [input.category, "stool-tests"],
  });
}
