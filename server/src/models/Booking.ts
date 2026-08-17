import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
import { EMAIL_RE, isValidPhone, isValidPincode } from "./validators.js";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: isValidPhone,
        message: "phone must be a valid 10-digit Indian mobile number",
      },
    },
    age: { type: Number, min: 0, max: 150 },
    // Date of birth ("YYYY-MM-DD") captured by the booking form; age stays
    // optional for API clients that send it directly.
    dob: { type: String, trim: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    email: { type: String, trim: true, lowercase: true, match: EMAIL_RE },
    gender: { type: String, enum: ["male", "female", "other", "prefer-not-to-say"] },
  },
  { _id: false },
);
// Patient is intentionally EMBEDDED, not a separate collection. For the
// current MVP each booking carries its own small, self-contained patient
// record and there is no cross-booking patient identity to manage. Introduce
// a Patient collection only when patients need accounts, medical history or
// loyalty features.

const addressSnapshotSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    // Locality/area name captured by the booking form (mirrors the frontend
    // BookingAddress type); landmark is the older optional alias.
    locality: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: isValidPincode, message: "pincode must be a 6-digit number" },
    },
    landmark: { type: String, trim: true },
  },
  { _id: false },
);
// addressSnapshot is an immutable COPY of the address at booking time, NOT a
// reference (no addressId): the user may edit or delete their saved address
// later, but the phlebotomist must still visit the address agreed at booking.

const priceBreakdownSchema = new mongoose.Schema(
  {
    testPrice: { type: Number, required: true, min: 0 },
    collectionFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
// Totals are computed by the booking service at creation time and stored as a
// snapshot — the schema deliberately does NOT recalculate them.

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true, index: true },
    labTestOfferingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTestOffering",
      required: true,
    },
    collectionMethod: {
      type: String,
      required: true,
      enum: ["home_collection", "lab_visit"],
    },
    // Stored as a "YYYY-MM-DD" string (not a Date) to avoid timezone drift on
    // date-only appointment values; ISO strings sort correctly as text.
    appointmentDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, index: true },
    appointmentTime: { type: String, required: true, trim: true },
    patient: { type: patientSchema, required: true },
    // Required for home_collection — enforced by the booking service layer.
    addressSnapshot: { type: addressSnapshotSchema },
    priceBreakdown: { type: priceBreakdownSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    // Optional patient notes for the lab.
    notes: { type: String, trim: true, maxlength: 500 },
    // Snapshot of the report-time label agreed at booking (e.g. "24 hours"),
    // so the confirmation/details stay stable even if the offering changes.
    expectedReportTime: { type: String, trim: true },
    // Set on status transitions by the booking service (no logic here yet).
    cancelledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// My Bookings page: a user's bookings, newest first.
bookingSchema.index({ userId: 1, createdAt: -1 });

export type IBooking = InferSchemaType<typeof bookingSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const Booking =
  (mongoose.models.Booking as Model<IBooking> | undefined) ?? mongoose.model<IBooking>("Booking", bookingSchema);
