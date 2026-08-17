import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { testsRouter } from "./tests.routes.js";
import { packagesRouter } from "./packages.routes.js";
import { labsRouter } from "./labs.routes.js";
import { labOfferingsRouter } from "./labOfferings.routes.js";
import { bookingsRouter } from "./bookings.routes.js";
import { addressRouter } from "./address.routes.js";

/**
 * API router. Health + catalogue endpoints (Phase 5F) are live; auth/users/
 * bookings remain placeholders for their later phases.
 */
export const apiRouter = Router();

apiRouter.use(healthRouter); // GET /api/health
apiRouter.use("/auth", authRouter); // Phase 5G — signup/login/logout/me
apiRouter.use("/users", usersRouter); // Phase 5I (later)
apiRouter.use("/categories", categoriesRouter); // Phase 5F
apiRouter.use("/tests", testsRouter); // Phase 5F
apiRouter.use("/packages", packagesRouter); // Phase 5F
apiRouter.use("/labs", labsRouter); // Phase 5F
apiRouter.use("/lab-offerings", labOfferingsRouter); // Phase 5F
apiRouter.use("/bookings", bookingsRouter); // Phase 5H
apiRouter.use("/addresses", addressRouter); // Phase 5I
