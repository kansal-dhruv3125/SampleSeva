/**
 * Phase 5E — seed the existing frontend catalogue into MongoDB.
 *
 * Source of truth: the existing frontend data modules (../../src/data/*).
 * This script does NOT invent or duplicate catalogue data.
 *
 * Idempotency: every write is an upsert keyed on stable slugs (categories,
 * tests, packages, labs) or the {labId, testId} compound (offerings), so
 * running the seed any number of times never creates duplicates.
 *
 * Dependency order: categories → tests → packages → labs → lab test offerings.
 *
 * Run from server/:  npm run seed
 */
import mongoose from "mongoose";
import type { Types } from "mongoose";
import { env } from "./config/env.js";
import { Category, Test, Package, Lab, LabTestOffering } from "./models/index.js";
import { categories } from "../../src/data/categories.js";
import { tests } from "../../src/data/tests.js";
import { packages } from "../../src/data/packages.js";
import { labs, labTestOfferings } from "../../src/data/labs.js";

type ObjectId = Types.ObjectId;

/**
 * The frontend test modules reference category slugs that are not present in
 * src/data/categories.ts (a pre-existing frontend inconsistency — e.g.
 * "heart" vs the canonical "heart-cardiac"). This maps each dangling
 * test-side slug to the canonical category slug from the existing catalogue.
 */
const CATEGORY_ALIASES: Record<string, string> = {
  heart: "heart-cardiac",
  nutrition: "vitamins-minerals",
  infectious: "infection-microbiology",
  autoimmune: "immunology",
  gi: "other-laboratory",
  bone: "vitamins-minerals",
  cancer: "other-laboratory",
};

/**
 * Which category each existing package belongs to (mirrors the frontend's
 * packagesByCategory() mapping) — stored on Package.category so the API can
 * filter packages by category (used by the TestsPage package fallback).
 */
const PACKAGE_CATEGORIES: Record<string, string> = {
  "basic-full-body-checkup": "full-body-checkups",
  "advanced-full-body-checkup": "full-body-checkups",
  "diabetes-care-package": "diabetes",
  "heart-health-package": "heart-cardiac",
  "womens-health-package": "womens-health",
  "mens-health-package": "mens-health",
};

/** Removes undefined values so $set never accidentally unsets fields. */
function compact<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
}

type ReportTime = { reportTime: number; reportTimeUnit: "hours" | "days" };

/** Normalizes the frontend reportTime union (number | "Same day" | "24 hours" | ...) to {number, unit}. */
function normalizeReportTime(value: number | string, unit?: string): ReportTime {
  if (typeof value === "number") {
    return { reportTime: value, reportTimeUnit: unit === "days" ? "days" : "hours" };
  }
  const s = value.trim().toLowerCase();
  if (s === "same day") return { reportTime: 24, reportTimeUnit: "hours" };
  const m = s.match(/^(\d+)\s*(hour|day)s?$/);
  if (m) {
    const n = Number.parseInt(m[1], 10);
    return m[2] === "day"
      ? { reportTime: n, reportTimeUnit: "days" }
      : { reportTime: n, reportTimeUnit: "hours" };
  }
  throw new Error(`[seed] cannot normalize reportTime value "${value}"`);
}

function resolveCategorySlug(test: { category?: string; categoryIds?: string[]; categories?: string[] }): string {
  const raw = test.category ?? test.categoryIds?.[0] ?? test.categories?.[0] ?? "";
  return CATEGORY_ALIASES[raw] ?? raw;
}

async function seedCategories(): Promise<Map<string, ObjectId>> {
  console.log(`[seed] seeding ${categories.length} categories...`);
  for (const c of categories) {
    await Category.updateOne(
      { slug: c.slug },
      {
        $set: {
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          icon: c.icon ?? "",
          isActive: true,
        },
      },
      { upsert: true },
    );
  }
  const docs = await Category.find({}).select("slug _id").lean();
  return new Map(docs.map((d) => [d.slug, d._id]));
}

async function seedTests(categoryIds: Map<string, ObjectId>): Promise<Map<string, ObjectId>> {
  let aliased = 0;
  // The source catalogue contains duplicate slugs (pre-existing frontend data
  // issue). Keep the FIRST occurrence per slug — matching the frontend's
  // getTestBySlug().find() semantics — so seed and UI agree on the canonical
  // row, and the count equals the number of unique slugs.
  const seen = new Set<string>();
  const collapsed: string[] = [];
  const uniqueTests = tests.filter((t) => {
    if (seen.has(t.slug)) {
      collapsed.push(t.slug);
      return false;
    }
    seen.add(t.slug);
    return true;
  });
  if (collapsed.length > 0) {
    console.warn(
      `[seed] source catalogue has duplicate slugs — keeping first occurrence of: ${[...new Set(collapsed)].join(", ")}`,
    );
  }
  console.log(`[seed] seeding ${uniqueTests.length} tests (from ${tests.length} source entries)...`);
  for (const t of uniqueTests) {
    const categorySlug = resolveCategorySlug(t);
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) {
      throw new Error(`[seed] test "${t.slug}" references unknown category "${categorySlug}"`);
    }
    if (CATEGORY_ALIASES[categorySlug]) aliased++;
    const rt = normalizeReportTime(t.reportTime, t.reportTimeUnit);
    await Test.updateOne(
      { slug: t.slug },
      {
        $set: compact({
          slug: t.slug,
          name: t.name,
          shortName: t.shortName,
          description: t.description,
          categoryId,
          sampleType: t.sampleType,
          parameters: t.parameters ?? [],
          tags: t.tags ?? [],
          fastingRequired: t.fastingRequired ?? /fasting|fast/i.test(t.fasting ?? ""),
          fastingHours: t.fastingHours,
          preparation: t.preparationInstructions ?? t.preparation ?? [],
          reportTime: rt.reportTime,
          reportTimeUnit: rt.reportTimeUnit,
          popular: t.popular ?? false,
          isActive: (t.status ?? "active") !== "inactive",
        }),
      },
      { upsert: true },
    );
  }
  if (aliased > 0) {
    console.warn(`[seed] ${aliased} tests mapped via category slug aliases (pre-existing frontend mismatch).`);
  }
  const docs = await Test.find({}).select("slug _id").lean();
  return new Map(docs.map((d) => [d.slug, d._id]));
}

async function seedPackages(testIds: Map<string, ObjectId>, categoryIds: Map<string, ObjectId>): Promise<void> {
  console.log(`[seed] seeding ${packages.length} packages...`);
  for (const p of packages) {
    const includedTests = (p.includedTests ?? [])
      .map((slug) => testIds.get(slug))
      .filter((id): id is ObjectId => id !== undefined);
    const missing = (p.includedTests ?? []).filter((slug) => !testIds.has(slug));
    if (missing.length > 0) {
      console.warn(`[seed] package "${p.slug}" — skipping unknown included tests: ${missing.join(", ")}`);
    }
    const categorySlug = PACKAGE_CATEGORIES[p.slug];
    const categoryId = categorySlug ? categoryIds.get(categorySlug) : undefined;
    await Package.updateOne(
      { slug: p.slug },
      {
        $set: compact({
          slug: p.slug,
          name: p.name,
          description: p.description ?? "",
          category: categoryId,
          includedTests,
          highlights: p.highlights ?? [],
          price: p.startingPrice,
          homeCollection: p.homeCollection ?? true,
          popular: p.popular ?? false,
          isActive: true,
        }),
      },
      { upsert: true },
    );
  }
}

async function seedLabs(): Promise<Map<string, ObjectId>> {
  console.log(`[seed] seeding ${labs.length} labs...`);
  for (const l of labs) {
    await Lab.updateOne(
      { slug: l.slug },
      {
        $set: compact({
          name: l.name,
          shortName: l.shortName,
          description: l.description ?? "",
          slug: l.slug,
          city: l.city,
          area: l.area ?? "",
          address: l.address,
          pincode: l.pincode ?? "",
          rating: l.rating ?? 0,
          reviewCount: l.reviewCount ?? 0,
          homeCollection: l.homeCollection ?? false,
          services: l.services ?? [],
          verified: l.verified ?? false,
          contact: { phone: l.phone, email: l.email },
          openingHours: l.openingHours ?? "",
          status: l.status === "inactive" ? "inactive" : "active",
        }),
      },
      { upsert: true },
    );
  }
  const docs = await Lab.find({}).select("slug _id").lean();
  return new Map(docs.map((d) => [d.slug, d._id]));
}

async function seedOfferings(labIds: Map<string, ObjectId>, testIds: Map<string, ObjectId>): Promise<void> {
  const skipped: string[] = [];
  console.log(`[seed] seeding ${labTestOfferings.length} lab test offerings...`);
  for (const o of labTestOfferings) {
    const labId = labIds.get(o.labId);
    const testId = testIds.get(o.testId);
    if (!labId || !testId) {
      skipped.push(o.id);
      continue;
    }
    const rt = normalizeReportTime(o.reportTime, o.reportTimeUnit);
    await LabTestOffering.updateOne(
      { labId, testId },
      {
        $set: compact({
          labId,
          testId,
          price: o.price,
          // Tri-state preserved verbatim from the catalogue so the API can
          // render "Home collection" / "Lab-dependent" / "Walk-in only"
          // exactly as the frontend demo did.
          homeCollectionAvailability: o.homeCollectionAvailability,
          // "lab-dependent" is treated as offering home collection (the lab
          // capability decides); only "unavailable" disables it.
          homeCollection: o.homeCollectionAvailability !== "unavailable",
          collectionFee: o.collectionFee ?? 0,
          reportTime: rt.reportTime,
          reportTimeUnit: rt.reportTimeUnit,
          availability: o.available === false ? "unavailable" : "available",
          isActive: true,
        }),
      },
      { upsert: true },
    );
  }
  if (skipped.length > 0) {
    console.warn(
      `[seed] skipped ${skipped.length} offerings with dangling test/lab refs (tests do not exist in the catalogue): ${skipped.join(", ")}`,
    );
  }
}

async function main(): Promise<void> {
  console.log("[seed] connecting to MongoDB...");
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10_000 });
  // Ensure unique indexes exist before upserting (also idempotent).
  await Promise.all([
    Category.init(),
    Test.init(),
    Package.init(),
    Lab.init(),
    LabTestOffering.init(),
  ]);

  const categoryIds = await seedCategories();
  const testIds = await seedTests(categoryIds);
  await seedPackages(testIds, categoryIds);
  const labIds = await seedLabs();
  await seedOfferings(labIds, testIds);

  const counts = {
    categories: await Category.countDocuments(),
    tests: await Test.countDocuments(),
    packages: await Package.countDocuments(),
    labs: await Lab.countDocuments(),
    labTestOfferings: await LabTestOffering.countDocuments(),
  };
  console.log("[seed] done. counts:", counts);
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("[seed] failed:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
