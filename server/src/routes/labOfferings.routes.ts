import { Router } from "express";
import {
  listLabOfferingsController,
  getOfferingByIdController,
} from "../controllers/labOfferings.controller.js";

/**
 * Lab-test offering endpoints (Phase 5F): filterable offerings list
 * (?labId= / ?testId=), single offering with lab + test context.
 */
export const labOfferingsRouter = Router();

labOfferingsRouter.get("/", listLabOfferingsController);
labOfferingsRouter.get("/:id", getOfferingByIdController);
