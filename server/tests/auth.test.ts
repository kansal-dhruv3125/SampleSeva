// Environment must be set before importing the app (config/env.ts validates
// MONGODB_URI at import time). The auth suite needs a real MongoDB: use
// TEST_MONGODB_URI, falling back to the configured MONGODB_URI, then a local
// default.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sampleseva-test";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";

// Dynamic import so the process.env assignments above take effect first.
const { createApp } = await import("../src/app.js");
const { User } = await import("../src/models/User.js");

const app = createApp();
const agent = request.agent(app);

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI ?? "", { serverSelectionTimeoutMS: 5000 });
  // Only ever touch the users collection — never other catalogue data.
  await User.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
});

const VALID_SIGNUP = {
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "9876543210",
  password: "secret123",
};

test("signup creates a user, sets an httpOnly session cookie, and never returns the password hash", async () => {
  const res = await agent.post("/api/auth/signup").send(VALID_SIGNUP);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.name, "Priya Sharma");
  assert.equal(res.body.data.user.email, "priya@example.com");
  assert.equal(res.body.data.user.role, "customer");
  assert.ok(res.body.data.user.id, "returns an id");
  assert.ok(res.body.data.user.createdAt, "returns createdAt");
  assert.equal("passwordHash" in res.body.data.user, false, "must never expose passwordHash");
  assert.equal("password" in res.body.data.user, false, "must never expose password");

  const setCookie = res.headers["set-cookie"] as unknown as string[] | undefined;
  assert.ok(setCookie && setCookie.some((c) => c.includes("sampleseva_token=")), "sets the session cookie");
  assert.ok(setCookie?.some((c) => c.toLowerCase().includes("httponly")), "cookie is httpOnly");
});

test("signup with a duplicate email returns 409", async () => {
  const res = await agent.post("/api/auth/signup").send({ ...VALID_SIGNUP, email: "PRIYA@example.com " });
  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /already exists/i);
});

test("signup with invalid input returns 400", async () => {
  const res = await agent.post("/api/auth/signup").send({ name: "A", email: "not-an-email", password: "123" });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test("login with correct credentials returns the user and sets a cookie", async () => {
  const res = await agent.post("/api/auth/login").send({
    email: "priya@example.com",
    password: "secret123",
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.email, "priya@example.com");
});

test("login with a wrong password returns 401", async () => {
  const res = await agent.post("/api/auth/login").send({
    email: "priya@example.com",
    password: "wrong-password",
  });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /incorrect password/i);
});

test("GET /api/auth/me returns the authenticated user", async () => {
  const res = await agent.get("/api/auth/me");
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.email, "priya@example.com");
  assert.equal("passwordHash" in res.body.data.user, false);
});

test("GET /api/auth/me without authentication returns 401", async () => {
  const anon = request.agent(app);
  const res = await anon.get("/api/auth/me");
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test("logout clears the session so /me is no longer accessible", async () => {
  const res = await agent.post("/api/auth/logout");
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  const me = await agent.get("/api/auth/me");
  assert.equal(me.status, 401);
});
