import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    // Key into the frontend icon map (src/components/cards/CategoryCard.tsx).
    icon: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ICategory = InferSchemaType<typeof categorySchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const Category =
  (mongoose.models.Category as Model<ICategory> | undefined) ??
  mongoose.model<ICategory>("Category", categorySchema);
