import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

const SAMPLE_TYPES = ["Blood", "Urine", "Stool", "Semen", "Saliva", "Swab", "Sputum", "Other"] as const;

const testSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    description: { type: String, required: true },
    // Primary category reference. Lab-specific pricing/availability/fees live
    // on LabTestOffering, never here.
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    sampleType: { type: String, required: true, enum: SAMPLE_TYPES },
    parameters: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    fastingRequired: { type: Boolean, default: false },
    fastingHours: { type: Number, min: 0 },
    // Multiple preparation instructions, not one long string.
    preparation: { type: [String], default: [] },
    // Report timing is numeric + unit (e.g. 6 hours, 2 days) — never strings
    // like "Same day" inside numeric fields. Consistent with the frontend
    // builder mapping (reportTime: number + reportTimeUnit).
    reportTime: { type: Number, required: true, min: 1 },
    reportTimeUnit: { type: String, required: true, enum: ["hours", "days"] },
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Catalogue queries: active tests, popular-first ordering.
testSchema.index({ isActive: 1, popular: 1 });
// Filter by sample type (blood / urine / ...).
testSchema.index({ sampleType: 1 });

export type ITest = InferSchemaType<typeof testSchema> & { createdAt: Date; updatedAt: Date };

export const Test = (mongoose.models.Test as Model<ITest> | undefined) ?? mongoose.model<ITest>("Test", testSchema);
