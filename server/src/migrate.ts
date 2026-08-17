import mongoose from "mongoose";
import { env } from "./config/env.js";

/**
 * Phase 5J — idempotent index migration.
 *
 * Fixes the stale non-sparse `users.phone_1` unique index that could exist in
 * databases created before Phase 5G made `phone` optional. A non-sparse index
 * treats every phone-less user as `{ phone: null }`, so a SECOND phone-less
 * signup collides with E11000. The schema now declares the index SPARSE.
 *
 * SAFE: only ever drops/recreates the `phone_1` index on the `users`
 * collection. No other index or data is touched, and every run is a no-op
 * once the index is already correct (idempotent).
 */

async function migratePhoneIndex(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) throw new Error("[migrate] no database handle");

  const users = db.collection("users");
  const indexes = await users.indexes();
  const phoneIndex = indexes.find((i) => i.name === "phone_1");

  if (phoneIndex && phoneIndex.sparse && phoneIndex.unique) {
    console.log("[migrate] users.phone_1 is already unique+sparse — nothing to do.");
    return;
  }

  if (phoneIndex) {
    // Stale (non-sparse or non-unique) — drop and recreate below.
    console.log(`[migrate] dropping stale users.phone_1 index (sparse=${Boolean(phoneIndex.sparse)}, unique=${Boolean(phoneIndex.unique)})`);
    await users.dropIndex("phone_1");
  } else {
    console.log("[migrate] users.phone_1 index missing — creating it.");
  }

  await users.createIndex({ phone: 1 }, { unique: true, sparse: true, name: "phone_1" });
  console.log("[migrate] created users.phone_1 as unique+sparse (phone-less users no longer collide).");
}

async function main(): Promise<void> {
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10000 });
  await migratePhoneIndex();
  await mongoose.disconnect();
  console.log("[migrate] done.");
}

main().catch((err) => {
  console.error(`[migrate] failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
