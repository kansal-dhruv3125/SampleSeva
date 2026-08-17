import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

/**
 * Builds the Express application.
 *
 * Exported separately from server.ts so tests can exercise it with supertest
 * without binding a port.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  // Correct client IPs for rate limiting when running behind a reverse proxy.
  app.set("trust proxy", env.isProd ? 1 : false);

  // --- Security foundation (Phase 5A plan) --------------------------------
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  // Session cookies (httpOnly JWT) for Phase 5G auth.
  app.use(cookieParser());

  // --- Request logging -----------------------------------------------------
  if (env.nodeEnv !== "test") {
    app.use(morgan(env.isProd ? "combined" : "dev"));
  }

  // --- API ------------------------------------------------------------------
  app.use("/api", apiLimiter);
  app.use("/api", apiRouter);

  // --- Fallbacks -------------------------------------------------------------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
