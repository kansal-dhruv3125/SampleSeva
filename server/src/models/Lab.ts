import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
import { EMAIL_RE, isValidPhone } from "./validators.js";

const contactSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      validate: {
        validator: isValidPhone,
        message: "phone must be a valid 10-digit Indian mobile number",
      },
    },
    email: { type: String, required: true, trim: true, lowercase: true, match: EMAIL_RE },
  },
  { _id: false },
);

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    // Marketing blurb shown on lab cards / detail pages (present in the
    // existing frontend catalogue; added in Phase 5F so the API can
    // represent the catalogue without UI changes).
    description: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true, index: true },
    area: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    homeCollection: { type: Boolean, default: false },
    // Lab specialisations / service tags (frontend Lab.services).
    services: { type: [String], default: [] },
    // Demo UI only — not real accreditation.
    verified: { type: Boolean, default: false },
    contact: { type: contactSchema, required: true },
    openingHours: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

// No test prices or per-test availability here — those live on LabTestOffering.

export type ILab = InferSchemaType<typeof labSchema> & { createdAt: Date; updatedAt: Date };

export const Lab = (mongoose.models.Lab as Model<ILab> | undefined) ?? mongoose.model<ILab>("Lab", labSchema);
