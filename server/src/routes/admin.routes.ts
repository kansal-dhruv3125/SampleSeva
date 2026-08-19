import { Router } from "express";
import {
  dashboardController,
  listUsersController,
  listLabsController,
  listBookingsController,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

/**
 * Admin API routes — all endpoints require authentication + admin role.
 *
 * GET /api/admin/dashboard  — summary statistics
 * GET /api/admin/users      — paginated customer list
 * GET /api/admin/labs       — paginated lab list
 * GET /api/admin/bookings   — paginated booking list
 */
export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

adminRouter.get("/dashboard", dashboardController);
adminRouter.get("/users", listUsersController);
adminRouter.get("/labs", listLabsController);
adminRouter.get("/bookings", listBookingsController);
