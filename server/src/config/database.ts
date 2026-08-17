import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * MongoDB connection (Phase 5C).
 *
 * - Connects using MONGODB_URI (required in all environments — fail fast if
 *   missing, see config/env.ts).
 * - Logs a successful connection without ever printing the URI or any
 *   credentials (the driver redacts passwords in error messages).
 * - Connection failures are logged and re-thrown — never silently swallowed.
 * - Guards against opening multiple connections (reuses an existing one).
 */

export type DatabaseState = "connected" | "connecting" | "disconnected";

const SERVER_SELECTION_TIMEOUT_MS = 10_000;

function onConnected(): void {
  console.log("[db] connected to MongoDB");
}

function onError(err: Error): void {
  console.error("[db] MongoDB connection error:", err instanceof Error ? err.message : String(err));
}

function onDisconnected(): void {
  console.warn("[db] disconnected from MongoDB");
}

/** Reports the current Mongoose connection state for the health endpoint. */
export function getDatabaseState(): DatabaseState {
  switch (mongoose.connection.readyState) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    default:
      return "disconnected";
  }
}

/**
 * Connects to MongoDB. Reuses an existing connection instead of opening a
 * second one. Throws on failure — callers (server.ts) treat that as fatal.
 */
export async function connectDB(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error("[db] MONGODB_URI is not configured — cannot connect to MongoDB.");
  }

  const state = getDatabaseState();
  if (state === "connected") {
    console.log("[db] already connected to MongoDB — reusing existing connection.");
    return;
  }

  // Register listeners once (off-then-on prevents duplicates across calls).
  mongoose.connection.off("connected", onConnected);
  mongoose.connection.off("error", onError);
  mongoose.connection.off("disconnected", onDisconnected);
  mongoose.connection.on("connected", onConnected);
  mongoose.connection.on("error", onError);
  mongoose.connection.on("disconnected", onDisconnected);

  try {
    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS });
  } catch (err) {
    console.error(
      "[db] failed to connect to MongoDB:",
      err instanceof Error ? err.message : String(err),
    );
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
