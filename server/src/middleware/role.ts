import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

type Role = IUser["role"];

/**
 * Middleware factory: requires the authenticated user to have one of the
 * specified roles. Must be used AFTER `requireAuth` (which sets req.userId
 * and req.userRole).
 *
 * Usage:
 *   router.get("/admin/users", requireAuth, requireRole("admin"), handler);
 *   router.get("/lab/bookings", requireAuth, requireRole("lab"), handler);
 */
export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.userRole;
    if (!role || !allowed.includes(role)) {
      throw new ApiError(
        403,
        "You do not have permission to access this resource.",
        "Forbidden",
      );
    }
    next();
  };
}

/** Convenience: require admin role. */
export const requireAdmin = requireRole("admin");

/** Convenience: require lab role. */
export const requireLab = requireRole("lab");

/** Convenience: require customer role. */
export const requireCustomer = requireRole("customer");
