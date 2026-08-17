import type { Request, Response } from "express";
import { listLabOfferings, getOfferingById } from "../services/catalogue.service.js";

/** GET /api/lab-offerings — filterable by ?labId=slug / ?testId=slug. */
export async function listLabOfferingsController(req: Request, res: Response): Promise<void> {
  const labId = typeof req.query.labId === "string" && req.query.labId.trim() ? req.query.labId : undefined;
  const testId = typeof req.query.testId === "string" && req.query.testId.trim() ? req.query.testId : undefined;
  const items = await listLabOfferings({ labId, testId });
  res.json({ success: true, data: { items } });
}

/** GET /api/lab-offerings/:id — single offering with lab + test context. */
export async function getOfferingByIdController(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  const data = await getOfferingById(id);
  res.json({ success: true, data });
}
