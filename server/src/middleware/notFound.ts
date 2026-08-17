import type { NextFunction, Request, Response } from "express";

/**
 * 404 for any route the API does not handle. SPA static serving will be
 * layered on top of this app in a later phase.
 */
export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
}
