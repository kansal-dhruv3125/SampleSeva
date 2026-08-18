import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import type mongoose from "mongoose";
import { env } from "../config/env.js";
import type { IUser } from "../models/User.js";

/** HTTP-only cookie that carries the session JWT. */
export const AUTH_COOKIE = "sampleseva_token";

/** Session lifetime: 7 days. */
export const SESSION_DAYS = 7;
export const SESSION_MAX_AGE_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: IUser["role"];
  createdAt: string;
};

export interface AuthTokenPayload {
  sub: string;
  role: IUser["role"];
}

/** Cookie settings — httpOnly, same-site Lax (dev frontend is same-site on localhost). */
export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: env.isProd ? "none" : "lax",
    secure: env.isProd,
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  };
}

export function createAuthToken(userId: string, role: IUser["role"]): string {
  return jwt.sign({ sub: userId, role } satisfies AuthTokenPayload, env.jwtSecret, {
    expiresIn: `${SESSION_DAYS}d`,
  });
}

/** Verifies the session JWT and returns its payload, or null when invalid/expired. */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload !== "object" || payload === null) return null;
    const { sub, role } = payload as jwt.JwtPayload & Partial<AuthTokenPayload>;
    if (typeof sub !== "string" || !sub) return null;
    return { sub, role: role ?? "customer" };
  } catch {
    return null;
  }
}

/** Returns only safe user fields — never the password hash. */
export function serializeUser(user: IUser & { _id: mongoose.Types.ObjectId }): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    ...(user.phone ? { phone: user.phone } : {}),
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Normalizes a phone number for storage: strip spaces/dashes, keep optional +91. */
export function normalizePhone(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[\s-]/g, "");
  return cleaned || undefined;
}

