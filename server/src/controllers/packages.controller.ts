import type { Request, Response } from "express";
import { listPackages, getPackageBySlug } from "../services/catalogue.service.js";

/** GET /api/packages — optional ?category= slug filter. */
export async function listPackagesController(req: Request, res: Response): Promise<void> {
  const category = typeof req.query.category === "string" && req.query.category.trim() ? req.query.category : undefined;
  const items = await listPackages(category);
  res.json({ success: true, data: { items } });
}

/** GET /api/packages/:slug — single package detail. */
export async function getPackageBySlugController(req: Request, res: Response): Promise<void> {
  const slug = typeof req.params.slug === "string" ? req.params.slug : "";
  const data = await getPackageBySlug(slug);
  res.json({ success: true, data });
}
