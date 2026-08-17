import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    // Real Test references, not arbitrary names. The future seed phase maps
    // the frontend's includedTests slugs to these ObjectIds.
    includedTests: { type: [mongoose.Schema.Types.ObjectId], ref: "Test", required: true, default: [] },
    highlights: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    // Package-level capability flags present in the existing frontend
    // catalogue (all current packages offer home collection).
    homeCollection: { type: Boolean, default: true },
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Reverse lookup: which packages include a given test.
packageSchema.index({ includedTests: 1 });

export type IPackage = InferSchemaType<typeof packageSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const Package =
  (mongoose.models.Package as Model<IPackage> | undefined) ?? mongoose.model<IPackage>("Package", packageSchema);
