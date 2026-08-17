import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
import { isValidPincode } from "./validators.js";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    // Area/locality name captured by the frontend address form (mirrors the
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
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Backstop: at most one default address per user. The address service layer
// must ALSO demote previous defaults when a new one is set — the unique index
// alone is not relied upon for that behavior.
addressSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);

export type IAddress = InferSchemaType<typeof addressSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const Address =
  (mongoose.models.Address as Model<IAddress> | undefined) ?? mongoose.model<IAddress>("Address", addressSchema);
