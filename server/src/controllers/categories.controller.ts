import type { Request, Response } from "express";
import { listCategories } from "../services/catalogue.service.js";

/** GET /api/categories — active categories with test/package counts. */
export async function listCategoriesController(_req: Request, res: Response): Promise<void> {
  const items = await listCategories();
  res.json({ success: true, data: { items } });
}
