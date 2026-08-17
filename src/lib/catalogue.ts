import { getCategoryById } from "../data/categories";
import type {
  HomeCollectionAvailability,
  SampleType,
  Test,
  TestFilterParams,
  TestSortOption,
} from "../types";

/** Format demo report turnaround for display. */
export function formatReportTime(test: Test): string {
  if (typeof test.reportTime === "string") return test.reportTime;
  if (test.reportTimeEnd !== undefined && test.reportTimeUnit === "days") {
    return `${test.reportTime}–${test.reportTimeEnd} days`;
  }
  if (test.reportTimeUnit === "hours") {
    if (test.reportTime <= 12) return "Same day (demo estimate)";
    return `${test.reportTime} hours`;
  }
  if (test.reportTime === 1) return "1 day";
  return `${test.reportTime} days`;
}

function getCategoryIds(test: Test): string[] {
  return test.categoryIds ?? test.categories ?? (test.category ? [test.category] : []);
}

function getSampleTypes(test: Test): SampleType[] {
  return test.sampleTypes ?? [test.sampleType];
}

function getHomeCollectionAvailability(test: Test): HomeCollectionAvailability {
  if (test.homeCollectionAvailability) return test.homeCollectionAvailability;
  if (test.homeCollectionAvailable) return test.homeCollectionAvailable;
  return test.homeCollection ? "available" : "unavailable";
}

function getFastingRequired(test: Test): boolean {
  if (test.fastingRequired !== undefined) return test.fastingRequired;
  return typeof test.fasting === "string" && /fasting|fast/i.test(test.fasting);
}

function getPrice(test: Test): number {
  return test.priceFrom ?? test.startingPrice ?? 0;
}

export function getHomeCollectionLabel(value: HomeCollectionAvailability): string {
  switch (value) {
    case "available":
      return "Home Collection Available";
    case "unavailable":
      return "Lab Visit Required";
    case "lab-dependent":
      return "Availability Depends on Lab";
  }
}

export function getFastingLabel(test: Test): string {
  if (!test.fastingRequired) return "Usually no fasting required";
  if (test.fastingHours) {
    return `Fasting may be required (typically ${test.fastingHours} hours — follow lab instructions)`;
  }
  return "Fasting may be required — follow the laboratory's instructions";
}

export function testSearchHaystack(test: Test): string {
  const categoryId = test.category ?? getCategoryIds(test)[0] ?? "";
  const categoryName = getCategoryById(categoryId)?.name ?? "";
  return [
    test.name,
    test.shortName ?? "",
    test.description,
    test.subcategory ?? "",
    categoryName,
    test.sampleType,
    ...getSampleTypes(test),
    ...(test.tags ?? []),
    ...(test.parameters ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

export function searchTests(catalogue: Test[], query: string): Test[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalogue;

  return catalogue.filter((test) => {
    const haystack = testSearchHaystack(test);
    if (haystack.includes(q)) return true;
    // Token match for multi-word queries
    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.every((token) => haystack.includes(token));
  });
}

export function filterTests(catalogue: Test[], params: TestFilterParams): Test[] {
  let result = catalogue.filter((t) => (t.status ?? "active") === "active");

  if (params.category) {
    result = result.filter((t) => getCategoryIds(t).includes(params.category!));
  }

  if (params.sampleType) {
    result = result.filter((t) => getSampleTypes(t).includes(params.sampleType!));
  }

  if (params.homeCollection === true) {
    result = result.filter((t) => {
      const availability = getHomeCollectionAvailability(t);
      return availability === "available" || availability === "lab-dependent";
    });
  } else if (params.homeCollection === false) {
    result = result.filter((t) => getHomeCollectionAvailability(t) === "unavailable");
  }

  if (params.fastingRequired === true) {
    result = result.filter((t) => getFastingRequired(t));
  } else if (params.fastingRequired === false) {
    result = result.filter((t) => !getFastingRequired(t));
  }

  if (params.popular) {
    result = result.filter((t) => t.popular === true);
  }

  if (params.priceMin !== undefined) {
    result = result.filter((t) => getPrice(t) >= params.priceMin!);
  }

  if (params.priceMax !== undefined) {
    result = result.filter((t) => getPrice(t) <= params.priceMax!);
  }

  if (params.query?.trim()) {
    result = searchTests(result, params.query);
  }

  return result;
}

export function sortTests(catalogue: Test[], sort: TestSortOption = "popular"): Test[] {
  const sorted = [...catalogue];
  switch (sort) {
    case "popular":
      return sorted.sort((a, b) => {
        if ((a.popular ?? false) !== (b.popular ?? false)) return a.popular ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    case "price-asc":
      return sorted.sort((a, b) => getPrice(a) - getPrice(b) || a.name.localeCompare(b.name));
    case "price-desc":
      return sorted.sort((a, b) => getPrice(b) - getPrice(a) || a.name.localeCompare(b.name));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function parseSampleTypeParam(value: string | null): SampleType | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  const map: Record<string, SampleType> = {
    blood: "Blood",
    urine: "Urine",
    stool: "Stool",
    semen: "Semen",
    saliva: "Saliva",
    swab: "Swab",
    sputum: "Sputum",
    other: "Other",
  };
  return map[normalized];
}

export function parseSortParam(value: string | null): TestSortOption {
  const valid: TestSortOption[] = ["popular", "price-asc", "price-desc", "name-asc"];
  if (value && valid.includes(value as TestSortOption)) return value as TestSortOption;
  return "popular";
}
