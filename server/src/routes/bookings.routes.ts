import { Router } from "express";
import {
  cancelBookingController,
  createBookingController,
  getBookingController,
  listBookingsController,
} from "../controllers/booking.controller.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Booking endpoints (Phase 5H): create / list / detail / cancel.
 * All endpoints require authentication — ownership is always the session user.
 */
export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);
bookingsRouter.post("/", createBookingController);
bookingsRouter.get("/", listBookingsController);
bookingsRouter.get("/:id", getBookingController);
bookingsRouter.patch("/:id/cancel", cancelBookingController);
