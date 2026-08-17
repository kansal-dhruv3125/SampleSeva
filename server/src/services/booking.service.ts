import mongoose from "mongoose";
import crypto from "node:crypto";
import { Booking, type IBooking } from "../models/Booking.js";
import { Test } from "../models/Test.js";
import { Lab } from "../models/Lab.js";
import { LabTestOffering } from "../models/LabTestOffering.js";
import { ApiError } from "../utils/ApiError.js";
import { offeringReportTimeLabel } from "./catalogue.service.js";
import type { CreateBookingInput } from "../validators/booking.validators.js";

/**
 * Booking service (Phase 5H).
 *
 * Ownership is always derived from the authenticated session (req.userId) —
 * the client can never choose whose booking is created or read. Prices are
 * recomputed server-side from the LabTestOffering and never trusted from the
 * client. Once created, a booking is a snapshot: only its status may change.
 */

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;

function isObjectId(value: string): boolean {
  return mongoose.isValidObjectId(value);
}

function assertObjectId(value: string, field: string): mongoose.Types.ObjectId {
  if (!isObjectId(value)) {
    throw new ApiError(400, `Invalid ${field}.`, "ValidationError");
  }
  return new mongoose.Types.ObjectId(value);
}

/** Generates a readable booking reference like SS-1A2B3C4D. */
function generateReference(): string {
  return `SS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

/** A booking with its test/lab populated for API responses. */
type PopulatedBooking = IBooking & {
  _id: mongoose.Types.ObjectId;
  testId: { _id: mongoose.Types.ObjectId; name: string; slug: string };
  labId: { _id: mongoose.Types.ObjectId; name: string; slug: string };
};

const POPULATE = [{ path: "testId", select: "name slug" }, { path: "labId", select: "name slug" }];

/**
 * Renders a booking in the exact shape the frontend `Booking` type expects
 * (see src/types). Only safe, public fields — no internal ObjectIds beyond the
 * referenced test/lab, no userId.
 */
export function serializeBooking(booking: PopulatedBooking): Record<string, unknown> {
  const test = booking.testId;
  const lab = booking.labId;
  const patient = booking.patient;
  const price = booking.priceBreakdown;
  const address = booking.addressSnapshot;

  return {
    id: booking._id.toString(),
    reference: booking.bookingReference,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : undefined,
    testId: test._id.toString(),
    labId: lab._id.toString(),
    testName: test.name,
    labName: lab.name,
    testSlug: test.slug,
    labSlug: lab.slug,
    amount: price.testPrice,
    collectionFee: price.collectionFee,
    preferredDate: booking.appointmentDate,
    preferredTime: booking.appointmentTime,
    collectionMode: booking.collectionMethod === "home_collection" ? "home" : "lab",
    patient: {
      fullName: patient.name,
      dob: patient.dob ?? undefined,
      gender: patient.gender ?? undefined,
      phone: patient.phone,
      email: patient.email ?? undefined,
    },
    address: address
      ? {
          line1: address.addressLine1,
          line2: address.addressLine2 ?? undefined,
          locality: address.locality ?? undefined,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        }
      : undefined,
    notes: booking.notes ?? undefined,
    expectedReportTime: booking.expectedReportTime ?? "Varies by lab",
  };
}

async function populateBooking(
  doc: mongoose.Document<unknown, object, IBooking> | null,
): Promise<PopulatedBooking | null> {
  if (!doc) return null;
  const populated = await doc.populate<Pick<PopulatedBooking, "testId" | "labId">>(POPULATE);
  return populated as unknown as PopulatedBooking;
}

/**
 * Creates a booking for the authenticated user. Prices are always derived
 * from the offering — any price fields sent by the client are ignored.
 */
export async function createBooking(userId: string, input: CreateBookingInput): Promise<Record<string, unknown>> {
  const testId = assertObjectId(input.testId, "test id");
  const labId = assertObjectId(input.labId, "lab id");
  const offeringId = assertObjectId(input.labTestOfferingId, "offering id");

  const [test, lab, offering] = await Promise.all([
    Test.findById(testId).select("_id isActive").lean(),
    Lab.findById(labId).select("_id status").lean(),
    LabTestOffering.findById(offeringId).lean(),
  ]);

  if (!test || !test.isActive) {
    throw new ApiError(400, "The selected test is not available.", "InvalidTest");
  }
  if (!lab || lab.status !== "active") {
    throw new ApiError(400, "The selected lab is not available.", "InvalidLab");
  }
  if (!offering || !offering.isActive || offering.availability !== "available") {
    throw new ApiError(400, "This test is not currently bookable at the selected lab.", "InvalidOffering");
  }
  // The offering must genuinely belong to the claimed lab AND test.
  if (offering.labId.toString() !== labId.toString() || offering.testId.toString() !== testId.toString()) {
    throw new ApiError(400, "The selected lab does not offer this test.", "OfferingMismatch");
  }

  const homeCollection = input.collectionMethod === "home_collection";
  if (homeCollection) {
    if (offering.homeCollectionAvailability === "unavailable") {
      throw new ApiError(400, "Home collection is not available for this test at the selected lab.", "HomeCollectionUnavailable");
    }
    if (!input.address) {
      throw new ApiError(400, "A collection address is required for home collection.", "ValidationError");
    }
  }

  // Server-side price — never trust client-sent amounts.
  const testPrice = offering.price;
  const collectionFee = homeCollection ? offering.collectionFee : 0;
  const discount = 0;
  const total = testPrice + collectionFee - discount;

  const address = input.address;
  const patient = input.patient;
  const base: Partial<IBooking> = {
    userId: new mongoose.Types.ObjectId(userId),
    testId,
    labId,
    labTestOfferingId: offeringId,
    collectionMethod: input.collectionMethod,
    appointmentDate: input.appointmentDate,
    appointmentTime: input.appointmentTime.trim(),
    patient: {
      name: patient.name.trim(),
      phone: patient.phone.replace(/[\s-]/g, ""),
      dob: patient.dob || undefined,
      email: patient.email?.trim().toLowerCase() || undefined,
      gender: (patient.gender as IBooking["patient"]["gender"]) || undefined,
    },
    ...(address
      ? {
          addressSnapshot: {
            addressLine1: address.line1.trim(),
            addressLine2: address.line2?.trim() || undefined,
            locality: address.locality?.trim() || undefined,
            city: address.city.trim(),
            state: address.state.trim(),
            pincode: address.pincode.trim(),
          },
        }
      : {}),
    priceBreakdown: { testPrice, collectionFee, discount, total },
    notes: input.notes?.trim() || undefined,
    expectedReportTime: offeringReportTimeLabel(offering.reportTime, offering.reportTimeUnit),
    status: "pending",
    cancelledAt: null,
    completedAt: null,
  };

  // Unique bookingReference — retry a couple of times on the (rare) collision.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const doc = await Booking.create({ ...base, bookingReference: generateReference() });
      const populated = await populateBooking(doc);
      return serializeBooking(populated as PopulatedBooking);
    } catch (err) {
      if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) continue;
      throw err;
    }
  }
  throw new ApiError(500, "Could not allocate a booking reference. Please try again.", "ReferenceExhausted");
}

/** Lists the authenticated user's bookings, newest first. */
export async function listBookings(userId: string): Promise<Array<Record<string, unknown>>> {
  const docs = await Booking.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .populate<Pick<PopulatedBooking, "testId" | "labId">>(POPULATE)
    .lean();
  return docs.map((doc) => serializeBooking(doc as unknown as PopulatedBooking));
}

/**
 * Fetches one booking owned by the user. A missing booking and another
 * user's booking both return 404 so booking ids cannot be probed (IDOR-safe).
 */
export async function getBookingById(userId: string, id: string): Promise<Record<string, unknown>> {
  if (!isObjectId(id)) {
    throw new ApiError(404, "Booking not found.", "NotFound");
  }
  const doc = await Booking.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) })
    .populate<Pick<PopulatedBooking, "testId" | "labId">>(POPULATE)
    .lean();
  if (!doc) {
    throw new ApiError(404, "Booking not found.", "NotFound");
  }
  return serializeBooking(doc as unknown as PopulatedBooking);
}

/**
 * Cancels a booking owned by the user. Only pending/confirmed bookings can be
 * cancelled; the atomic status filter prevents double-cancellation races.
 */
export async function cancelBooking(userId: string, id: string): Promise<Record<string, unknown>> {
  if (!isObjectId(id)) {
    throw new ApiError(404, "Booking not found.", "NotFound");
  }

  const doc = await Booking.findOneAndUpdate(
    {
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: [...CANCELLABLE_STATUSES] },
    },
    { $set: { status: "cancelled", cancelledAt: new Date() } },
    { new: true },
  ).populate<Pick<PopulatedBooking, "testId" | "labId">>(POPULATE);

  if (doc) {
    return serializeBooking(doc as unknown as PopulatedBooking);
  }

  // No match: distinguish "not yours / missing" (404) from "already
  // cancelled or completed" (409) without leaking another user's booking.
  const existing = await Booking.exists({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
  if (!existing) {
    throw new ApiError(404, "Booking not found.", "NotFound");
  }
  throw new ApiError(409, "This booking cannot be cancelled in its current state.", "InvalidTransition");
}
