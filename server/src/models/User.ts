import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
import { EMAIL_RE, isValidPhone } from "./validators.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: EMAIL_RE,
    },
    // Optional to match the existing signup UX (mobile number is optional on
    // the registration form). The index must be SPARSE so documents that omit
    // the field are not indexed as null — otherwise a second phone-less user
    // collides on the unique index.
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: isValidPhone,
        message: "phone must be a valid 10-digit Indian mobile number",
      },
    },
    // Only ever the output of a password hasher — never a plaintext password.
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "lab_admin", "platform_admin"],
      default: "customer",
    },
  },
  { timestamps: true },
);

export type IUser = InferSchemaType<typeof userSchema> & { createdAt: Date; updatedAt: Date };

// Guard against OverwriteModelError during hot reload / tsx watch.
export const User =
  (mongoose.models.User as Model<IUser> | undefined) ?? mongoose.model<IUser>("User", userSchema);
