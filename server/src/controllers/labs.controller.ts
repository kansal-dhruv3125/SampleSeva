import type { Request, Response } from "express";
import type { LabSort } from "../services/catalogue.service.js";
import { listLabs, getLabBySlug } from "../services/catalogue.service.js";
import { parseBool, parsePositiveInt } from "../utils/query.js";

/** GET /api/labs — list active labs with city/search/home-collection filters. */
export async function listLabsController(req: Request, res: Response): Promise<void> {
  const { city, q, sort } = req.query;
  const data = await listLabs({
    city: typeof city === "string" && city.trim() ? city : undefined,
    q: typeof q === "string" && q.trim() ? q : undefined,
    homeCollection: parseBool(req.query.homeCollection),
    sort: typeof sort === "string" ? (sort as LabSort) : undefined,
    page: parsePositiveInt(req.query.page),
    limit: parsePositiveInt(req.query.limit),
  });
  res.json({ success: true, data });
}

/** GET /api/labs/:slug — single lab detail with offering count. */
export async function getLabBySlugController(req: Request, res: Response): Promise<void> {
  const slug = typeof req.params.slug === "string" ? req.params.slug : "";
  const data = await getLabBySlug(slug);
  res.json({ success: true, data });
}
