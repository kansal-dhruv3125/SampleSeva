import type { Request, Response } from "express";
import {
  getDashboardStats,
  listUsers,
  listLabs,
  listBookings,
} from "../services/admin.service.js";

/** GET /api/admin/dashboard — summary statistics. */
export async function dashboardController(_req: Request, res: Response): Promise<void> {
  const stats = await getDashboardStats();
  res.json({ success: true, data: stats });
}

/** GET /api/admin/users — paginated customer list. */
export async function listUsersController(req: Request, res: Response): Promise<void> {
  const page = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limit = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const data = await listUsers({ page, limit, search });
  res.json({ success: true, data });
}

/** GET /api/admin/labs — paginated lab list. */
export async function listLabsController(req: Request, res: Response): Promise<void> {
  const page = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limit = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const data = await listLabs({ page, limit, search });
  res.json({ success: true, data });
}

/** GET /api/admin/bookings — paginated booking list. */
export async function listBookingsController(req: Request, res: Response): Promise<void> {
  const page = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limit = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const data = await listBookings({ page, limit, status });
  res.json({ success: true, data });
}
