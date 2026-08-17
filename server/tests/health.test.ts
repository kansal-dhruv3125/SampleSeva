// Environment must be set before importing the app: config/env.ts validates
// MONGODB_URI (required) and config/app.ts reads NODE_ENV at import time.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/sampleseva-test";

import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

// Dynamic import so the process.env assignments above take effect first.
const { createApp } = await import("../src/app.js");

const app = createApp();

test("GET /api/health reports database disconnected (503) when MongoDB is unavailable", async () => {
  // No MongoDB connection exists in the test process, so the health endpoint
  // must report the database as unavailable with a non-success status.
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 503);
  assert.equal(res.body.success, false);
  assert.equal(res.body.database, "disconnected");
});

test("unknown API routes return a JSON 404 in the failure shape", async () => {
  const res = await request(app).get("/api/does-not-exist");
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.equal(typeof res.body.message, "string");
});
