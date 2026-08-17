// Environment must be set before importing the app (config/env.ts validates
// MONGODB_URI at import time). The booking suite needs a real MongoDB: use
// TEST_MONGODB_URI, falling back to the configured MONGODB_URI, then a local
// default.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sampleseva-booking-test";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";

// Dynamic import so the process.env assignments above take effect first.
const { createApp } = await import("../src/app.js");
const { User } = await import("../src/models/User.js");
const { Category } = await import("../src/models/Category.js");
const { Test } = await import("../src/models/Test.js");
const { Lab } = await import("../src/models/Lab.js");
const { LabTestOffering } = await import("../src/models/LabTestOffering.js");
const { Booking } = await import("../src/models/Booking.js");

const app = createApp();
const agentA = request.agent(app);
const agentB = request.agent(app);

let userAId = "";
let userBId = "";
let testId = "";
let labId = "";
let offeringId = "";

const OFFERING_PRICE = 499;
const OFFERING_FEE = 80;

function validPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    testId,
    labId,
    labTestOfferingId: offeringId,
    collectionMethod: "home_collection",
    appointmentDate: "2026-09-01",
    appointmentTime: "9:00 AM - 12:00 PM",
    patient: {
      name: "Asha Nair",
      phone: "9876543210",
      dob: "1990-05-14",
      gender: "female",
      email: "asha@example.com",
    },
    address: {
      line1: "Plot 42, MG Road",
      line2: "2nd Floor",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
    },
    notes: "Please call before arriving",
    // Deliberately bogus — the server must compute the real price.
    amount: 1,
    collectionFee: 999,
    ...overrides,
  };
}

async function signup(agent: request.Agent, email: string): Promise<string> {
  const res = await agent.post("/api/auth/signup").send({
    name: "Test User",
    email,
    password: "secret123",
  });
  assert.equal(res.status, 201);
  return res.body.data.user.id as string;
}

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI ?? "", { serverSelectionTimeoutMS: 5000 });
  // Drop the whole throwaway test database so stale indexes (e.g. the old
  // non-sparse phone index) can never leak into this run.
  await mongoose.connection.dropDatabase();

  userAId = await signup(agentA, "asha@example.com");
  userBId = await signup(agentB, "rohan@example.com");

  const category = await Category.create({ name: "Blood Tests", slug: "blood-tests", description: "Blood" });
  const test = await Test.create({
    slug: "cbc-test",
    name: "Complete Blood Count",
    shortName: "CBC",
    description: "Counts blood cells",
    categoryId: category._id,
    sampleType: "Blood",
    parameters: ["WBC", "RBC"],
    tags: ["blood"],
    fastingRequired: false,
    preparation: [],
    reportTime: 6,
    reportTimeUnit: "hours",
    popular: true,
    isActive: true,
  });
  const lab = await Lab.create({
    name: "CityLab Diagnostics",
    slug: "citylab-diagnostics",
    city: "Bengaluru",
    area: "Indiranagar",
    address: "MG Road",
    rating: 4.5,
    reviewCount: 120,
    homeCollection: true,
    contact: { phone: "9876512345", email: "citylab@example.com" },
    status: "active",
  });
  const offering = await LabTestOffering.create({
    labId: lab._id,
    testId: test._id,
    price: OFFERING_PRICE,
    homeCollection: true,
    homeCollectionAvailability: "available",
    collectionFee: OFFERING_FEE,
    reportTime: 24,
    reportTimeUnit: "hours",
    availability: "available",
    isActive: true,
  });

  testId = test._id.toString();
  labId = lab._id.toString();
  offeringId = offering._id.toString();
});

after(async () => {
  await mongoose.disconnect();
});

test("unauthenticated booking creation is rejected", async () => {
  const anon = request.agent(app);
  const res = await anon.post("/api/bookings").send(validPayload());
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test("unauthenticated booking list/detail/cancel are rejected", async () => {
  const anon = request.agent(app);
  assert.equal((await anon.get("/api/bookings")).status, 401);
  assert.equal((await anon.get("/api/bookings/000000000000000000000000")).status, 401);
  assert.equal((await anon.patch("/api/bookings/000000000000000000000000/cancel")).status, 401);
});

test("booking creation succeeds and the server computes the price (client price ignored)", async () => {
  const res = await agentA.post("/api/bookings").send(validPayload());
  assert.equal(res.status, 201);
  const booking = res.body.data.booking;
  assert.match(booking.reference, /^SS-[A-F0-9]{8}$/);
  assert.equal(booking.status, "pending");
  assert.equal(booking.testName, "Complete Blood Count");
  assert.equal(booking.labName, "CityLab Diagnostics");
  // Home collection → collectionFee from the offering applies; client's bogus
  // amount/collectionFee (1 / 999) must be ignored.
  assert.equal(booking.amount, OFFERING_PRICE);
  assert.equal(booking.collectionFee, OFFERING_FEE);
  assert.equal(booking.patient.fullName, "Asha Nair");
  assert.equal(booking.address.city, "Bengaluru");
  assert.equal(booking.expectedReportTime, "24 hours");
  assert.equal(booking.userId, undefined, "must not expose userId");
});

test("booking with an invalid test id is rejected", async () => {
  const res = await agentA.post("/api/bookings").send(
    validPayload({ testId: new mongoose.Types.ObjectId().toString() }),
  );
  assert.equal(res.status, 400);
  assert.match(res.body.message, /test/i);
});

test("booking with an invalid lab id is rejected", async () => {
  const res = await agentA.post("/api/bookings").send(
    validPayload({ labId: new mongoose.Types.ObjectId().toString() }),
  );
  assert.equal(res.status, 400);
  assert.match(res.body.message, /lab/i);
});

test("booking with an offering that does not belong to the lab/test is rejected", async () => {
  const otherTest = await Test.create({
    slug: "other-test",
    name: "Other Test",
    description: "Other",
    categoryId: new mongoose.Types.ObjectId(),
    sampleType: "Blood",
    reportTime: 2,
    reportTimeUnit: "days",
    isActive: true,
  });
  const mismatched = await LabTestOffering.create({
    labId: new mongoose.Types.ObjectId(),
    testId: otherTest._id,
    price: 100,
    reportTime: 2,
    reportTimeUnit: "days",
    availability: "available",
  });
  const res = await agentA.post("/api/bookings").send(
    validPayload({ labTestOfferingId: mismatched._id.toString() }),
  );
  assert.equal(res.status, 400);
  assert.match(res.body.message, /does not offer/i);
});

test("home collection without an address is rejected", async () => {
  const res = await agentA.post("/api/bookings").send(
    validPayload({ address: undefined }),
  );
  assert.equal(res.status, 400);
  assert.match(res.body.message, /address/i);
});

test("GET /api/bookings returns only the authenticated user's bookings", async () => {
  const beforeCount = (await agentA.get("/api/bookings")).body.data.total;
  const res = await agentB.post("/api/bookings").send(
    validPayload({ appointmentDate: "2026-09-02" }),
  );
  assert.equal(res.status, 201);

  const mine = await agentA.get("/api/bookings");
  assert.equal(mine.status, 200);
  assert.equal(mine.body.data.total, beforeCount, "user A's list must not grow when user B books");

  const theirs = await agentB.get("/api/bookings");
  // User B only has the booking they just created — not A's history.
  assert.equal(theirs.body.data.total, 1);
  for (const booking of theirs.body.data.items) {
    assert.notEqual(booking.id, mine.body.data.items[0]?.id);
  }
});

test("another user's booking cannot be accessed (IDOR-safe 404)", async () => {
  const mine = await agentA.post("/api/bookings").send(validPayload());
  const myId = mine.body.data.booking.id as string;

  const res = await agentB.get(`/api/bookings/${myId}`);
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);

  const cancel = await agentB.patch(`/api/bookings/${myId}/cancel`);
  assert.equal(cancel.status, 404);
});

test("booking cancellation works and is persisted", async () => {
  const res = await agentA.post("/api/bookings").send(validPayload());
  const id = res.body.data.booking.id as string;
  assert.equal(res.body.data.booking.status, "pending");

  const cancel = await agentA.patch(`/api/bookings/${id}/cancel`);
  assert.equal(cancel.status, 200);
  assert.equal(cancel.body.data.booking.status, "cancelled");
  assert.ok(cancel.body.data.booking.cancelledAt);

  const detail = await agentA.get(`/api/bookings/${id}`);
  assert.equal(detail.body.data.booking.status, "cancelled");
});

test("invalid cancellation transitions are rejected", async () => {
  const res = await agentA.post("/api/bookings").send(validPayload());
  const id = res.body.data.booking.id as string;

  await agentA.patch(`/api/bookings/${id}/cancel`);
  // Already cancelled → 409, not a silent success.
  const again = await agentA.patch(`/api/bookings/${id}/cancel`);
  assert.equal(again.status, 409);
  assert.equal(again.body.success, false);

  // Cancelling a missing booking → 404.
  const missing = await agentA.patch(
    `/api/bookings/${new mongoose.Types.ObjectId().toString()}/cancel`,
  );
  assert.equal(missing.status, 404);
});

test("booking snapshot stays stable after creation (price/address/patient/report time)", async () => {
  const res = await agentA.post("/api/bookings").send(
    validPayload({
      patient: { name: "Stable Patient", phone: "9123456789", gender: "male" },
      address: { line1: "Old Address", city: "Mysuru", state: "Karnataka", pincode: "570001" },
    }),
  );
  const id = res.body.data.booking.id as string;
  const created = res.body.data.booking;

  // Mutate the offering after the booking exists — the booking must not change.
  await LabTestOffering.findByIdAndUpdate(offeringId, { $set: { price: 9999, collectionFee: 999 } });
  await Test.findByIdAndUpdate(testId, { $set: { name: "Renamed Test" } });

  const detail = await agentA.get(`/api/bookings/${id}`);
  const fetched = detail.body.data.booking;
  assert.equal(fetched.amount, created.amount, "price snapshot unchanged");
  assert.equal(fetched.collectionFee, created.collectionFee, "collection fee snapshot unchanged");
  assert.deepEqual(fetched.address, created.address, "address snapshot unchanged");
  assert.deepEqual(fetched.patient, created.patient, "patient snapshot unchanged");
  assert.equal(fetched.expectedReportTime, created.expectedReportTime, "report time snapshot unchanged");
  // References stay stable; name is a live reference by design (5D).
  assert.equal(fetched.testId, created.testId);
  assert.equal(fetched.labId, created.labId);
});
