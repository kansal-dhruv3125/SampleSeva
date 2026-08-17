import { Router } from "express";
import {
  signupController,
  loginController,
  meController,
  logoutController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

/**
 * Authentication endpoints (Phase 5G): signup / login / logout / me.
 * A stricter rate limit applies to the whole auth router to slow down
 * credential-stuffing attempts.
 */
export const authRouter = Router();

authRouter.use(authLimiter);
authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.get("/me", requireAuth, meController);
authRouter.post("/logout", logoutController);
