import { Router } from "express";
import {
  listTestsController,
  getTestBySlugController,
  getTestOfferingsController,
} from "../controllers/tests.controller.js";

/**
 * Catalogue endpoints (Phase 5F): list/filter/sort/paginate tests,
 * test detail, test offerings.
 */
export const testsRouter = Router();

testsRouter.get("/", listTestsController);
testsRouter.get("/:slug", getTestBySlugController);
testsRouter.get("/:slug/offerings", getTestOfferingsController);
