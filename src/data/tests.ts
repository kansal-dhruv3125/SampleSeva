import type { Test } from "../types";
import { bloodTests } from "./tests/blood";
import { diabetesTests } from "./tests/diabetes";
import { thyroidTests } from "./tests/thyroid";
import { cardiacTests } from "./tests/cardiac";
import { renalTests } from "./tests/renal";
import { liverTests } from "./tests/liver";
import { giTests } from "./tests/gi";
import { autoimmunTests } from "./tests/autoimmune";
import { boneTests } from "./tests/bone";
import { nutritionalTests } from "./tests/nutrition";
import { hormonalTests } from "./tests/hormonal";
import { infectiousTests } from "./tests/infectious";
import { cancerTests } from "./tests/cancer";
import { clottingTests } from "./tests/clotting";

/**
 * Demo catalogue of laboratory tests.
 *
 * All names, prices and preparation notes are fictional sample data.
 * In later phases this module will be replaced by API responses with the same shape.
 *
 * This Phase 2.1 expansion includes ~150 tests across major medical specialties:
 * - Blood counts and morphology (hematology)
 * - Diabetes and glucose metabolism
 * - Thyroid function
 * - Cardiac and cardiac risk
 * - Renal/kidney function
 * - Liver function
 * - Gastrointestinal health
 * - Autoimmune/rheumatologic markers
 * - Bone and metabolic bone disease
 * - Nutritional and mineral status
 * - Hormonal assessment
 * - Infectious disease serology
 * - Cancer screening markers
 * - Coagulation and bleeding disorders
 */
export const tests: Test[] = [
  ...bloodTests,
  ...diabetesTests,
  ...thyroidTests,
  ...cardiacTests,
  ...renalTests,
  ...liverTests,
  ...giTests,
  ...autoimmunTests,
  ...boneTests,
  ...nutritionalTests,
  ...hormonalTests,
  ...infectiousTests,
  ...cancerTests,
  ...clottingTests,
];

export const popularTests: Test[] = tests.filter((t) => t.popular);

export function getTestBySlug(slug: string): Test | undefined {
  return tests.find((t) => t.slug === slug);
}

export function getTestById(id: string): Test | undefined {
  return tests.find((t) => t.id === id);
}

export function testsByCategory(categoryId: string): Test[] {
  return tests.filter((t) =>
    (t.categoryIds ?? t.categories ?? (t.category ? [t.category] : [])).includes(categoryId),
  );
}
