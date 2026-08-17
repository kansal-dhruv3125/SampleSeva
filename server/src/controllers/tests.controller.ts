import type { Request, Response } from "express";
import type { TestSort } from "../services/catalogue.service.js";
import { listTests, getTestBySlug, getTestOfferings } from "../services/catalogue.service.js";
import { parseBool, parseNumber, parsePositiveInt } from "../utils/query.js";

/** GET /api/tests — search / filter / sort / paginate the test catalogue. */
export async function listTestsController(req: Request, res: Response): Promise<void> {
  const { q, category, sampleType, sort } = req.query;
  const data = await listTests({
    q: typeof q === "string" && q.trim() ? q : undefined,
    category: typeof category === "string" && category.trim() ? category : undefined,
    sampleType: typeof sampleType === "string" && sampleType.trim() ? sampleType : undefined,
    homeCollection: parseBool(req.query.homeCollection),
    fastingRequired: parseBool(req.query.fastingRequired),
    popular: parseBool(req.query.popular),
    priceMin: parseNumber(req.query.priceMin),
    priceMax: parseNumber(req.query.priceMax),
    sort: typeof sort === "string" ? (sort as TestSort) : undefined,
    page: parsePositiveInt(req.query.page),
    limit: parsePositiveInt(req.query.limit),
  });
  res.json({ success: true, data });
}

/** GET /api/tests/:slug — single test detail. */
export async function getTestBySlugController(req: Request, res: Response): Promise<void> {
  const slug = typeof req.params.slug === "string" ? req.params.slug : "";
  const data = await getTestBySlug(slug);
  res.json({ success: true, data });
}

/** GET /api/tests/:slug/offerings — labs offering this test (with lab summary). */
export async function getTestOfferingsController(req: Request, res: Response): Promise<void> {
  const slug = typeof req.params.slug === "string" ? req.params.slug : "";
  const items = await getTestOfferings(slug);
  res.json({ success: true, data: { items } });
}
