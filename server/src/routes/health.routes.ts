import { Router } from "express";
import { getDatabaseState } from "../config/database.js";

export const healthRouter = Router();

/**
 * Liveness check for dev tooling, load balancers and deployments.
 * Reports API + database state; returns a non-success status when the
 * database is not connected rather than pretending it is.
 */
healthRouter.get("/health", (_req, res) => {
  const database = getDatabaseState();

  if (database === "connected") {
    res.status(200).json({
      success: true,
      message: "SampleSeva API is running",
      database,
    });
  } else {
    res.status(503).json({
      success: false,
      message: "SampleSeva API is running but the database is unavailable",
      database,
    });
  }
});
