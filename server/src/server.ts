import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/database.js";

/**
 * Startup sequence (Phase 5C):
 *   1. Environment is loaded and validated by config/env.ts (import time —
 *      missing required configuration fails fast).
 *   2. Connect to MongoDB. A failed connection is fatal: the API never
 *      starts without a database.
 *   3. Only then start the Express server.
 */
async function main(): Promise<void> {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[server] SampleSeva API listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`[server] received ${signal} — shutting down`);
    server.close(() => {
      void disconnectDB().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err: unknown) => {
  console.error(
    "[server] startup failed:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
