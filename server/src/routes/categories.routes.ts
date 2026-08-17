import { Router } from "express";
import { listCategoriesController } from "../controllers/categories.controller.js";

/**
 * Category endpoints (Phase 5F): active categories with test/package counts.
 */
export const categoriesRouter = Router();

categoriesRouter.get("/", listCategoriesController);
