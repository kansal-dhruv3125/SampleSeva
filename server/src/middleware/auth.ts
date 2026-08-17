import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { AUTH_COOKIE, verifyAuthToken } from "../utils/auth.js";

/**
 * Authentication middleware for protected routes. Reads the httpOnly session
 * cookie, verifies the JWT, and attaches userId/userRole to the request.
 * Responds 401 when the session is missing, invalid or expired.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;
  if (!token) {
    throw new ApiError(401, "Authentication required. Please sign in.", "Unauthorized");
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    throw new ApiError(401, "Your session has expired. Please sign in again.", "Unauthorized");
  }

  req.userId = payload.sub;
  req.userRole = payload.role as IUser["role"];
  next();
}
