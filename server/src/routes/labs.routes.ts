import { Router } from "express";
import { listLabsController, getLabBySlugController } from "../controllers/labs.controller.js";

/**
 * Lab endpoints (Phase 5F): list/filter labs, lab detail.
 */
export const labsRouter = Router();

labsRouter.get("/", listLabsController);
labsRouter.get("/:slug", getLabBySlugController);
