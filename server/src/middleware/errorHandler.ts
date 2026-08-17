import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

/**
 * Central error handler. Always responds with the standard failure shape
 * ({ success, message, error }) and never leaks stack traces or raw error
 * messages in production.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError
    ? err.message
    : env.isProd
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";

  if (!isApiError) {
    console.error("[error] unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: isApiError ? err.errorCode : "InternalServerError",
  });
}
