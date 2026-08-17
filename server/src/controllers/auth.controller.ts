import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { AUTH_COOKIE, authCookieOptions, createAuthToken } from "../utils/auth.js";
import { getUserById, loginUser, signupUser } from "../services/auth.service.js";
import { validateLogin, validateSignup } from "../validators/auth.validators.js";

/** POST /api/auth/signup — create account (auto sign-in via cookie). */
export async function signupController(req: Request, res: Response): Promise<void> {
  const validation = validateSignup(req.body ?? {});
  if (!validation.isValid) {
    const first = Object.values(validation.errors)[0];
    throw new ApiError(400, first ?? "Invalid signup details.", "ValidationError");
  }

  const user = await signupUser({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
  });

  const token = createAuthToken(user.id, user.role);
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  res.status(201).json({ success: true, data: { user } });
}

/** POST /api/auth/login — authenticate and set the session cookie. */
export async function loginController(req: Request, res: Response): Promise<void> {
  const validation = validateLogin(req.body ?? {});
  if (!validation.isValid) {
    const first = Object.values(validation.errors)[0];
    throw new ApiError(400, first ?? "Invalid login details.", "ValidationError");
  }

  const user = await loginUser({ email: req.body.email, password: req.body.password });
  const token = createAuthToken(user.id, user.role);
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  res.json({ success: true, data: { user } });
}

/** GET /api/auth/me — current authenticated user (protected). */
export async function meController(req: Request, res: Response): Promise<void> {
  const user = await getUserById(req.userId ?? "");
  res.json({ success: true, data: { user } });
}

/** POST /api/auth/logout — clear the session cookie. */
export async function logoutController(_req: Request, res: Response): Promise<void> {
  res.clearCookie(AUTH_COOKIE, { ...authCookieOptions(), maxAge: undefined });
  res.json({ success: true, data: { loggedOut: true } });
}
