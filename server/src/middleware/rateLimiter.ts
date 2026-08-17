import { rateLimit } from "express-rate-limit";

/**
 * Foundation rate limiting applied to the whole API. Per-endpoint limits
 * (e.g. a stricter limit on auth routes) can be layered on top.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests — please try again later.",
  },
});

/**
 * Stricter limit for authentication endpoints (signup/login) to slow down
 * credential stuffing and account creation spam. Generous enough for local
 * development and the test suite; tighten in production.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many sign-in attempts — please try again later.",
  },
});
