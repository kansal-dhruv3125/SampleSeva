import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

/**
 * One document = ONE lab offering ONE test (price, availability, terms).
 * Example: CityLab Diagnostics offers CBC at ₹229 with home collection.
 */
const labTestOfferingSchema = new mongoose.Schema(
  {
    labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    homeCollection: { type: Boolean, default: false },
    // Tri-state home-collection availability mirrored from the frontend
    // catalogue ("lab-dependent" = the lab's capability decides). The boolean
    // homeCollection above is kept in sync by the seed for legacy consumers.
    homeCollectionAvailability: {
      type: String,
      enum: ["available", "unavailable", "lab-dependent"],
      default: "available",
    },
    collectionFee: { type: Number, default: 0, min: 0 },
    // Per-lab report timing; overrides the Test default when it differs.
    reportTime: { type: Number, required: true, min: 1 },
    reportTimeUnit: { type: String, required: true, enum: ["hours", "days"] },
    availability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    // Only when this lab's preparation instructions differ from the Test.
    preparationOverride: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One canonical offering per (lab, test). A FULL compound unique index (not a
// partial index on isActive): even a single inactive duplicate would create
// ambiguity about which row is canonical and would complicate the seed
// process's idempotent upsert (keyed on labId + testId). Deactivation is
// expressed by flipping isActive/availability on the one row (soft-disable).
labTestOfferingSchema.index({ labId: 1, testId: 1 }, { unique: true });

export type ILabTestOffering = InferSchemaType<typeof labTestOfferingSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const LabTestOffering =
  (mongoose.models.LabTestOffering as Model<ILabTestOffering> | undefined) ??
  mongoose.model<ILabTestOffering>("LabTestOffering", labTestOfferingSchema);
