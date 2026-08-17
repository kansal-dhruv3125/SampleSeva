import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { cancelBooking, createBooking, getBookingById, listBookings } from "../services/booking.service.js";
import { validateCreateBooking } from "../validators/booking.validators.js";

/**
 * Booking controllers (Phase 5H). Every handler requires authentication
 * (requireAuth sets req.userId) and scopes all queries to that user.
 */

/** POST /api/bookings — create a booking for the authenticated user. */
export async function createBookingController(req: Request, res: Response): Promise<void> {
  const validation = validateCreateBooking(req.body ?? {});
  if (!validation.isValid) {
    const first = Object.values(validation.errors)[0];
    throw new ApiError(400, first ?? "Invalid booking details.", "ValidationError");
  }

  const booking = await createBooking(req.userId ?? "", {
    testId: req.body.testId,
    labId: req.body.labId,
    labTestOfferingId: req.body.labTestOfferingId,
    collectionMethod: req.body.collectionMethod,
    appointmentDate: req.body.appointmentDate,
    appointmentTime: req.body.appointmentTime,
    patient: req.body.patient,
    address: req.body.address,
    notes: req.body.notes,
  });

  res.status(201).json({ success: true, data: { booking } });
}

/** GET /api/bookings — the authenticated user's bookings, newest first. */
export async function listBookingsController(req: Request, res: Response): Promise<void> {
  const bookings = await listBookings(req.userId ?? "");
  res.json({ success: true, data: { items: bookings, total: bookings.length } });
}

/** GET /api/bookings/:id — one booking owned by the authenticated user. */
export async function getBookingController(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  const booking = await getBookingById(req.userId ?? "", id);
  res.json({ success: true, data: { booking } });
}

/** PATCH /api/bookings/:id/cancel — cancel a booking owned by the user. */
export async function cancelBookingController(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  const booking = await cancelBooking(req.userId ?? "", id);
  res.json({ success: true, data: { booking } });
}
