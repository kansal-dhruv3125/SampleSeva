/**
 * Phase 5F — catalogue query + serialization service.
 *
 * Reads the seeded catalogue (Category / Test / Package / Lab /
 * LabTestOffering) and serializes documents into the exact shapes the
 * existing frontend types expect (src/types/index.ts), so the UI needs no
 * redesign. The frontend's own search/filter/sort semantics
 * (src/lib/catalogue.ts) are mirrored here so the API query surface behaves
 * like the demo data layer it replaces.
 *
 * The catalogue is small (121 tests, 143 offerings), so per-request joins and
 * JS-side filtering are deliberate: they keep the endpoint semantics identical
 * to the demo layer and the code obvious. Aggregations can replace the JS
 * passes when the catalogue grows (the endpoint shape stays the same).
 */
import mongoose from "mongoose";
import type { QueryFilter } from "mongoose";
import { Category, Test, Package, Lab, LabTestOffering } from "../models/index.js";
import type { ICategory } from "../models/Category.js";
import type { ITest } from "../models/Test.js";
import type { IPackage } from "../models/Package.js";
import type { ILab } from "../models/Lab.js";
import type { ILabTestOffering } from "../models/LabTestOffering.js";
import { ApiError } from "../utils/ApiError.js";

type ObjectId = mongoose.Types.ObjectId;

export type HomeAvailability = "available" | "unavailable" | "lab-dependent";
export type TestSort = "popular" | "price-asc" | "price-desc" | "name-asc";
export type LabSort = "highest-rated" | "most-reviews" | "most-tests" | "name-asc";

const SAMPLE_TYPES = ["Blood", "Urine", "Stool", "Semen", "Saliva", "Swab", "Sputum", "Other"];
const TEST_SORTS: TestSort[] = ["popular", "price-asc", "price-desc", "name-asc"];
const LAB_SORTS: LabSort[] = ["highest-rated", "most-reviews", "most-tests", "name-asc"];

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested in tests/catalogue.test.ts — no database needed)
// ---------------------------------------------------------------------------

export interface OfferingStats {
  count: number;
  minPrice: number | null;
  availableHome: number;
  labDependentHome: number;
  unavailableHome: number;
}

export function emptyOfferingStats(): OfferingStats {
  return { count: 0, minPrice: null, availableHome: 0, labDependentHome: 0, unavailableHome: 0 };
}

/** Test-level home-collection state derived from its offerings' tri-state. */
export function testHomeCollectionAvailability(stats: OfferingStats): HomeAvailability {
  if (stats.count === 0) return "unavailable";
  const { availableHome, labDependentHome, unavailableHome } = stats;
  if (availableHome > 0 && unavailableHome === 0) return "available";
  if (availableHome > 0 || labDependentHome > 0) return "lab-dependent";
  return "unavailable";
}

/** Renders a numeric report time back to the display label the UI used ("24 hours"). */
export function offeringReportTimeLabel(reportTime: number, unit: "hours" | "days"): string {
  if (unit === "hours") return reportTime === 1 ? "1 hour" : `${reportTime} hours`;
  return reportTime === 1 ? "1 day" : `${reportTime} days`;
}

export interface TestSearchInput {
  name: string;
  shortName?: string;
  description: string;
  sampleType: string;
  tags: string[];
  parameters: string[];
  categoryName: string;
}

/** Haystack mirroring src/lib/catalogue.ts testSearchHaystack(). */
export function testSearchHaystack(input: TestSearchInput): string {
  return [
    input.name,
    input.shortName ?? "",
    input.description,
    input.categoryName,
    input.sampleType,
    ...input.tags,
    ...input.parameters,
  ]
    .join(" ")
    .toLowerCase();
}

/** Token-match search mirroring src/lib/catalogue.ts searchTests(). */
export function matchesTestQuery(input: TestSearchInput, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = testSearchHaystack(input);
  if (haystack.includes(q)) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export interface SortableTest {
  name: string;
  popular: boolean;
  price: number;
}

/** Mirror of src/lib/catalogue.ts sortTests(). */
export function compareTests(a: SortableTest, b: SortableTest, sort: TestSort): number {
  switch (sort) {
    case "price-asc":
      return a.price - b.price || a.name.localeCompare(b.name);
    case "price-desc":
      return b.price - a.price || a.name.localeCompare(b.name);
    case "name-asc":
      return a.name.localeCompare(b.name);
    case "popular":
    default:
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name);
  }
}

/** Escapes user input used inside RegExp literals. */

// ---------------------------------------------------------------------------
// Serializers (MongoDB documents -> frontend-shaped DTOs)
// ---------------------------------------------------------------------------

export interface CategoryDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  testCount: number;
  packageCount: number;
}

export interface TestDTO {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  category: string;
  categoryIds: string[];
  categories: string[];
  description: string;
  sampleType: string;
  sampleTypes: string[];
  homeCollection: boolean;
  homeCollectionAvailability: HomeAvailability;
  homeCollectionAvailable: HomeAvailability;
  fastingRequired: boolean;
  fastingHours?: number;
  preparation: string[];
  preparationInstructions: string[];
  reportTime: number;
  reportTimeUnit: "hours" | "days";
  parameters: string[];
  tags: string[];
  popular: boolean;
  status: "active" | "inactive";
  priceFrom: number;
  startingPrice: number;
}

export interface PackageDTO {
  id: string;
  slug: string;
  name: string;
  testsCount: number;
  description: string;
  startingPrice: number;
  homeCollection: boolean;
  popular: boolean;
  includedTests: string[];
  highlights: string[];
}

export interface LabDTO {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  openingHours: string;
  services: string[];
  homeCollection: boolean;
  verified: boolean;
  status: "active" | "inactive";
  testsOffered: number;
}

export interface OfferingDTO {
  id: string;
  labId: string;
  testId: string;
  /** Real database ObjectIds for the booking API (labId/testId are slugs). */
  labObjectId: string;
  testObjectId: string;
  price: number;
  homeCollectionAvailability: HomeAvailability;
  reportTime: string;
  reportTimeUnit: "hours" | "days";
  available: boolean;
  collectionFee: number;
}

export interface LabSummary {
  slug: string;
  name: string;
  city: string;
  area: string;
  rating: number;
  reviewCount: number;
}

export interface TestSummary {
  id: string;
  slug: string;
  name: string;
  sampleType: string;
}

export interface OfferingWithLabDTO extends OfferingDTO {
  lab: LabSummary;
}

export interface OfferingWithTestDTO extends OfferingDTO {
  test: TestSummary;
}

export interface OfferingWithContextDTO extends OfferingDTO {
  lab: LabSummary;
  test: TestSummary;
}

export function serializeCategory(category: ICategory, testCount: number, packageCount: number): CategoryDTO {
  return {
    id: category.slug,
    slug: category.slug,
    name: category.name,
    description: category.description ?? "",
    icon: category.icon ?? "",
    testCount,
    packageCount,
  };
}

export function serializeTest(test: ITest, categorySlug: string, stats: OfferingStats): TestDTO {
  const price = stats.minPrice ?? 0;
  const homeCollectionAvailability = testHomeCollectionAvailability(stats);
  const active = test.isActive !== false;
  return {
    id: test.slug,
    slug: test.slug,
    name: test.name,
    ...(test.shortName ? { shortName: test.shortName } : {}),
    category: categorySlug,
    categoryIds: [categorySlug],
    categories: [categorySlug],
    description: test.description,
    sampleType: test.sampleType,
    sampleTypes: [test.sampleType],
    homeCollection: homeCollectionAvailability !== "unavailable",
    homeCollectionAvailability,
    homeCollectionAvailable: homeCollectionAvailability,
    fastingRequired: test.fastingRequired,
    ...(typeof test.fastingHours === "number" ? { fastingHours: test.fastingHours } : {}),
    preparation: test.preparation ?? [],
    preparationInstructions: test.preparation ?? [],
    reportTime: test.reportTime,
    reportTimeUnit: test.reportTimeUnit,
    parameters: test.parameters ?? [],
    tags: test.tags ?? [],
    popular: test.popular,
    status: active ? "active" : "inactive",
    priceFrom: price,
    startingPrice: price,
  };
}

export function serializePackage(pkg: IPackage, testSlugs: string[]): PackageDTO {
  return {
    id: pkg.slug,
    slug: pkg.slug,
    name: pkg.name,
    testsCount: pkg.includedTests.length,
    description: pkg.description ?? "",
    startingPrice: pkg.price,
    homeCollection: pkg.homeCollection,
    popular: pkg.popular,
    includedTests: testSlugs,
    highlights: pkg.highlights ?? [],
  };
}

export function serializeLab(lab: ILab, testsOffered: number): LabDTO {
  return {
    id: lab.slug,
    slug: lab.slug,
    name: lab.name,
    ...(lab.shortName ? { shortName: lab.shortName } : {}),
    description: lab.description ?? "",
    city: lab.city,
    area: lab.area ?? "",
    address: lab.address,
    pincode: lab.pincode ?? "",
    phone: lab.contact.phone,
    email: lab.contact.email,
    rating: lab.rating,
    reviewCount: lab.reviewCount,
    openingHours: lab.openingHours ?? "",
    services: lab.services ?? [],
    homeCollection: lab.homeCollection,
    verified: lab.verified,
    status: lab.status === "active" ? "active" : "inactive",
    testsOffered,
  };
}

export function serializeOffering(offering: ILabTestOffering & { _id: ObjectId }, labSlug: string, testSlug: string): OfferingDTO {
  const homeCollectionAvailability =
    offering.homeCollectionAvailability ?? (offering.homeCollection ? "available" : "unavailable");
  return {
    id: offering._id.toString(),
    labId: labSlug,
    testId: testSlug,
    // Real database references (the booking API requires ObjectIds; slugs
    // above are the display-facing ids used across the catalogue UI).
    labObjectId: offering.labId.toString(),
    testObjectId: offering.testId.toString(),
    price: offering.price,
    homeCollectionAvailability,
    reportTime: offeringReportTimeLabel(offering.reportTime, offering.reportTimeUnit),
    reportTimeUnit: offering.reportTimeUnit,
    available: offering.availability === "available",
    collectionFee: offering.collectionFee,
  };
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

interface CategoryRef {
  slug: string;
  name: string;
}

/** categoryId (string) -> { slug, name } for serialization + category filters. */
async function loadCategoryRefs(): Promise<Map<string, CategoryRef>> {
  const cats = await Category.find({}).select("slug name").lean();
  return new Map(cats.map((c) => [c._id.toString(), { slug: c.slug, name: c.name }]));
}

/** Per-test offering stats (min price + home-collection breakdown). */
async function computeOfferingStats(testIds: ObjectId[]): Promise<Map<string, OfferingStats>> {
  const map = new Map<string, OfferingStats>();
  for (const id of testIds) map.set(id.toString(), emptyOfferingStats());
  if (testIds.length === 0) return map;

  const offerings = await LabTestOffering.find({ isActive: true, testId: { $in: testIds } })
    .select("testId price homeCollection homeCollectionAvailability")
    .lean();

  for (const o of offerings) {
    const row = map.get(o.testId.toString());
    if (!row) continue;
    row.count += 1;
    if (row.minPrice === null || o.price < row.minPrice) row.minPrice = o.price;
    const availability = o.homeCollectionAvailability ?? (o.homeCollection ? "available" : "unavailable");
    if (availability === "available") row.availableHome += 1;
    else if (availability === "lab-dependent") row.labDependentHome += 1;
    else row.unavailableHome += 1;
  }
  return map;
}

/** labId (string) -> active offering count. */
async function computeLabOfferingCounts(labIds: ObjectId[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (labIds.length === 0) return map;
  const offerings = await LabTestOffering.find({ isActive: true, labId: { $in: labIds } })
    .select("labId")
    .lean();
  for (const o of offerings) {
    const key = o.labId.toString();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

/** testId (string) -> slug for package includedTests serialization. */
async function loadTestSlugMap(testIds: ObjectId[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (testIds.length === 0) return map;
  const tests = await Test.find({ _id: { $in: testIds } }).select("slug").lean();
  for (const t of tests) map.set(t._id.toString(), t.slug);
  return map;
}

async function loadLabMap(labIds: ObjectId[]): Promise<Map<string, ILab>> {
  const map = new Map<string, ILab>();
  if (labIds.length === 0) return map;
  const labs = await Lab.find({ _id: { $in: labIds } }).lean();
  for (const l of labs) map.set(l._id.toString(), l);
  return map;
}

async function loadTestMap(testIds: ObjectId[]): Promise<Map<string, ITest>> {
  const map = new Map<string, ITest>();
  if (testIds.length === 0) return map;
  const tests = await Test.find({ _id: { $in: testIds } }).lean();
  for (const t of tests) map.set(t._id.toString(), t);
  return map;
}

function labSummary(lab: ILab): LabSummary {
  return {
    slug: lab.slug,
    name: lab.name,
    city: lab.city,
    area: lab.area ?? "",
    rating: lab.rating,
    reviewCount: lab.reviewCount,
  };
}

function testSummary(test: ITest): TestSummary {
  return {
    id: test.slug,
    slug: test.slug,
    name: test.name,
    sampleType: test.sampleType,
  };
}

// ---------------------------------------------------------------------------
// Query functions (used by the controllers)
// ---------------------------------------------------------------------------

export async function listCategories(): Promise<CategoryDTO[]> {
  const [cats, testRows, packageRows] = await Promise.all([
    Category.find({ isActive: true }).lean(),
    Test.aggregate<{ _id: ObjectId; count: number }>([
      { $match: { isActive: true } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]),
    Package.aggregate<{ _id: ObjectId; count: number }>([
      { $match: { isActive: true, category: { $ne: null } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);
  const testCounts = new Map(testRows.map((r) => [r._id.toString(), r.count]));
  const packageCounts = new Map(packageRows.map((r) => [r._id.toString(), r.count]));

  return cats.map((c) =>
    serializeCategory(c, testCounts.get(c._id.toString()) ?? 0, packageCounts.get(c._id.toString()) ?? 0),
  );
}

export interface TestListParams {
  q?: string;
  category?: string;
  sampleType?: string;
  homeCollection?: boolean;
  fastingRequired?: boolean;
  popular?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: TestSort;
  page?: number;
  limit?: number;
}

export async function listTests(params: TestListParams): Promise<{ items: TestDTO[]; total: number }> {
  const categoryRefs = await loadCategoryRefs();
  const slugToId = new Map([...categoryRefs].map(([id, ref]) => [ref.slug, id]));

  const filter: QueryFilter<ITest> = { isActive: true };
  if (params.category) {
    const categoryId = slugToId.get(params.category);
    if (!categoryId) return { items: [], total: 0 };
    filter.categoryId = categoryId;
  }
  if (params.sampleType && SAMPLE_TYPES.includes(params.sampleType)) {
    // SAMPLE_TYPES.includes guards the value, so the cast is safe.
    filter.sampleType = params.sampleType as ITest["sampleType"];
  }
  if (params.popular === true) filter.popular = true;
  if (params.fastingRequired !== undefined) filter.fastingRequired = params.fastingRequired;

  const docs = await Test.find(filter).lean();
  const stats = await computeOfferingStats(docs.map((d) => d._id));

  let rows = docs.map((d) => {
    const statsForTest = stats.get(d._id.toString()) ?? emptyOfferingStats();
    const ref = categoryRefs.get(d.categoryId.toString());
    return { dto: serializeTest(d, ref?.slug ?? "", statsForTest), stats: statsForTest };
  });

  if (params.q?.trim()) {
    const query = params.q;
    rows = rows.filter(({ dto }) =>
      matchesTestQuery(
        {
          name: dto.name,
          shortName: dto.shortName,
          description: dto.description,
          sampleType: dto.sampleType,
          tags: dto.tags,
          parameters: dto.parameters,
          categoryName: categoryRefs.get(dto.category)?.name ?? "",
        },
        query,
      ),
    );
  }

  rows = rows.filter(({ dto, stats }) => {
    const price = stats.minPrice ?? 0;
    if (params.priceMin !== undefined && price < params.priceMin) return false;
    if (params.priceMax !== undefined && price > params.priceMax) return false;
    if (params.homeCollection === true) {
      return dto.homeCollectionAvailability === "available" || dto.homeCollectionAvailability === "lab-dependent";
    }
    if (params.homeCollection === false) return dto.homeCollectionAvailability === "unavailable";
    return true;
  });

  const sort = params.sort && TEST_SORTS.includes(params.sort) ? params.sort : "popular";
  rows.sort((a, b) =>
    compareTests(
      { name: a.dto.name, popular: a.dto.popular, price: a.stats.minPrice ?? 0 },
      { name: b.dto.name, popular: b.dto.popular, price: b.stats.minPrice ?? 0 },
      sort,
    ),
  );

  const total = rows.length;
  if (params.limit !== undefined && params.limit > 0) {
    const page = Math.max(1, params.page ?? 1);
    const start = (page - 1) * params.limit;
    rows = rows.slice(start, start + params.limit);
  }

  return { items: rows.map((r) => r.dto), total };
}

export async function getTestBySlug(slug: string): Promise<TestDTO> {
  const test = await Test.findOne({ slug, isActive: true }).lean();
  if (!test) throw new ApiError(404, "Test not found", "TestNotFound");
  const categoryRefs = await loadCategoryRefs();
  const ref = categoryRefs.get(test.categoryId.toString());
  const stats = (await computeOfferingStats([test._id])).get(test._id.toString()) ?? emptyOfferingStats();
  return serializeTest(test, ref?.slug ?? "", stats);
}

export async function getTestOfferings(slug: string): Promise<OfferingWithLabDTO[]> {
  const test = await Test.findOne({ slug, isActive: true }).lean();
  if (!test) throw new ApiError(404, "Test not found", "TestNotFound");

  const offerings = await LabTestOffering.find({ testId: test._id, isActive: true }).lean();
  const labs = await loadLabMap(offerings.map((o) => o.labId));

  return offerings
    .map((o) => {
      const lab = labs.get(o.labId.toString());
      if (!lab || lab.status !== "active") return null;
      return { ...serializeOffering(o, lab.slug, test.slug), lab: labSummary(lab) };
    })
    .filter((row): row is OfferingWithLabDTO => row !== null);
}

export async function listPackages(categorySlug?: string): Promise<PackageDTO[]> {
  const filter: QueryFilter<IPackage> = { isActive: true };
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug, isActive: true }).select("_id").lean();
    if (!category) return [];
    filter.category = category._id;
  }

  const docs = await Package.find(filter).lean();
  const testIds = docs.flatMap((p) => p.includedTests);
  const slugMap = await loadTestSlugMap(testIds);

  return docs.map((p) => serializePackage(p, p.includedTests.map((id) => slugMap.get(id.toString()) ?? "")));
}

export async function getPackageBySlug(slug: string): Promise<PackageDTO> {
  const pkg = await Package.findOne({ slug, isActive: true }).lean();
  if (!pkg) throw new ApiError(404, "Package not found", "PackageNotFound");
  const slugMap = await loadTestSlugMap(pkg.includedTests);
  return serializePackage(pkg, pkg.includedTests.map((id) => slugMap.get(id.toString()) ?? ""));
}

export interface LabListParams {
  city?: string;
  q?: string;
  homeCollection?: boolean;
  sort?: LabSort;
  page?: number;
  limit?: number;
}

export async function listLabs(params: LabListParams): Promise<{ items: LabDTO[]; total: number }> {
  const filter: QueryFilter<ILab> = { status: "active" };
  if (params.city) filter.city = new RegExp(`^${escapeRegExp(params.city)}$`, "i");
  if (params.homeCollection === true) filter.homeCollection = true;

  const docs = await Lab.find(filter).lean();
  const counts = await computeLabOfferingCounts(docs.map((d) => d._id));

  let rows = docs
    .map((d) => ({ dto: serializeLab(d, counts.get(d._id.toString()) ?? 0) }))
    .filter(({ dto }) => {
      const q = params.q?.trim().toLowerCase();
      if (!q) return true;
      return (
        dto.name.toLowerCase().includes(q) ||
        dto.city.toLowerCase().includes(q) ||
        dto.area.toLowerCase().includes(q)
      );
    });

  const sort = params.sort && LAB_SORTS.includes(params.sort) ? params.sort : "highest-rated";
  rows.sort((a, b) => {
    switch (sort) {
      case "most-reviews":
        return b.dto.reviewCount - a.dto.reviewCount;
      case "most-tests":
        return b.dto.testsOffered - a.dto.testsOffered;
      case "name-asc":
        return a.dto.name.localeCompare(b.dto.name);
      case "highest-rated":
      default:
        return b.dto.rating - a.dto.rating;
    }
  });

  const total = rows.length;
  if (params.limit !== undefined && params.limit > 0) {
    const page = Math.max(1, params.page ?? 1);
    const start = (page - 1) * params.limit;
    rows = rows.slice(start, start + params.limit);
  }
  return { items: rows.map((r) => r.dto), total };
}

export async function getLabBySlug(slug: string): Promise<LabDTO> {
  const lab = await Lab.findOne({ slug, status: "active" }).lean();
  if (!lab) throw new ApiError(404, "Lab not found", "LabNotFound");
  const counts = await computeLabOfferingCounts([lab._id]);
  return serializeLab(lab, counts.get(lab._id.toString()) ?? 0);
}

export interface LabOfferingFilters {
  labId?: string;
  testId?: string;
}

export async function listLabOfferings(filters: LabOfferingFilters): Promise<OfferingWithContextDTO[]> {
  const filter: QueryFilter<ILabTestOffering> = { isActive: true };
  if (filters.labId) {
    const lab = await Lab.findOne({ slug: filters.labId }).select("_id").lean();
    if (!lab) return [];
    filter.labId = lab._id;
  }
  if (filters.testId) {
    const test = await Test.findOne({ slug: filters.testId }).select("_id").lean();
    if (!test) return [];
    filter.testId = test._id;
  }

  const offerings = await LabTestOffering.find(filter).lean();
  const [labs, tests] = await Promise.all([
    loadLabMap(offerings.map((o) => o.labId)),
    loadTestMap(offerings.map((o) => o.testId)),
  ]);

  return offerings
    .map((o) => {
      const lab = labs.get(o.labId.toString());
      const test = tests.get(o.testId.toString());
      if (!lab || !test || lab.status !== "active") return null;
      return { ...serializeOffering(o, lab.slug, test.slug), lab: labSummary(lab), test: testSummary(test) };
    })
    .filter((row): row is OfferingWithContextDTO => row !== null);
}

export async function getOfferingById(id: string): Promise<OfferingWithContextDTO> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, "Offering not found", "OfferingNotFound");
  }
  const offering = await LabTestOffering.findById(id).lean();
  if (!offering) throw new ApiError(404, "Offering not found", "OfferingNotFound");

  const [lab, test] = await Promise.all([Lab.findById(offering.labId).lean(), Test.findById(offering.testId).lean()]);
  if (!lab || !test || lab.status !== "active") {
    throw new ApiError(404, "Offering not found", "OfferingNotFound");
  }
  return { ...serializeOffering(offering, lab.slug, test.slug), lab: labSummary(lab), test: testSummary(test) };
}

const REGEX_META = new Set([".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\"]);

/**
 * Escapes user input used inside RegExp literals (e.g. city names).
 * Written without a regex-literal char class so tooling can never mangle it.
 */
export function escapeRegExp(value: string): string {
  // Backslash built via String.fromCharCode so no literal escapes live in the
  // source (they get mangled by tooling); the output is the meta char escaped.
  const backslash = String.fromCharCode(92);
  let out = "";
  for (const ch of value) {
    out += REGEX_META.has(ch) ? backslash + ch : ch;
  }
  return out;
}
