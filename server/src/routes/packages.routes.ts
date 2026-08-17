import { Router } from "express";
import {
  listPackagesController,
  getPackageBySlugController,
} from "../controllers/packages.controller.js";

/**
 * Package endpoints (Phase 5F): list (optional ?category=), package detail.
 */
export const packagesRouter = Router();

packagesRouter.get("/", listPackagesController);
packagesRouter.get("/:slug", getPackageBySlugController);
