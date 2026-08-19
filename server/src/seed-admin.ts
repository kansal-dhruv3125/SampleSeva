/**
 * Secure admin account creation script.
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables.
 * Never hardcodes credentials in source code.
 *
 * Usage (from server/):
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourSecurePassword npm run seed:admin
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./config/env.js";
import { User } from "./models/User.js";

const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error("[seed-admin] ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
    console.error("[seed-admin] Example:");
    console.error('  ADMIN_EMAIL=admin@sampleseva.com ADMIN_PASSWORD=yourSecurePassword npm run seed:admin');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("[seed-admin] ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  console.log("[seed-admin] connecting to MongoDB...");
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10_000 });

  const existing = await User.findOne({ email: email.trim().toLowerCase() }).lean();
  if (existing) {
    if (existing.role === "admin") {
      console.log(`[seed-admin] Admin account ${email} already exists. Skipping.`);
    } else {
      console.log(`[seed-admin] User ${email} exists with role "${existing.role}". Updating to admin...`);
      await User.updateOne(
        { _id: existing._id },
        { $set: { role: "admin" } },
      );
      console.log(`[seed-admin] User ${email} is now an admin.`);
    }
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: "admin",
  });

  console.log(`[seed-admin] Admin account created: ${email}`);
  console.log("[seed-admin] You can now log in at /admin/login");
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("[seed-admin] failed:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
