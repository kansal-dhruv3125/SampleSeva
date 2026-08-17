// Environment must be set before importing the app (config/env.ts validates
// MONGODB_URI at import time). The address suite needs a real MongoDB.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sampleseva-address-test";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";

// Dynamic import so the process.env assignments above take effect first.
const { createApp } = await import("../src/app.js");
const { User } = await import("../src/models/User.js");
const { Address } = await import("../src/models/Address.js");
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

function validAddress(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    label: "Home",
    line1: "12 Lake View Rd",
    line2: "2nd Cross",
    locality: "Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    ...overrides,
  };
}

async function signup(agent: request.Agent, email: string): Promise<string> {
  const res = await agent.post("/api/auth/signup").send({ name: "Addr User", email, password: "secret123" });
  assert.equal(res.status, 201);
  return res.body.data.user.id as string;
}

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI ?? "", { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();
  userAId = await signup(agentA, "addr-a@example.com");
  userBId = await signup(agentB, "addr-b@example.com");
});

after(async () => {
  await mongoose.disconnect();
});

test("unauthenticated address requests are rejected", async () => {
  const anon = request.agent(app);
  assert.equal((await anon.get("/api/addresses")).status, 401);
  assert.equal((await anon.post("/api/addresses").send(validAddress())).status, 401);
  assert.equal((await anon.patch("/api/addresses/000000000000000000000000").send({})).status, 401);
  assert.equal((await anon.delete("/api/addresses/000000000000000000000000")).status, 401);
});

test("authenticated user can create an address", async () => {
  const res = await agentA.post("/api/addresses").send(validAddress());
  assert.equal(res.status, 201);
  const address = res.body.data.address;
  assert.ok(address.id);
  assert.equal(address.line1, "12 Lake View Rd");
  assert.equal(address.locality, "Koramangala");
  assert.equal(address.city, "Bengaluru");
  assert.equal(address.pincode, "560034");
  assert.equal(address.isDefault, false);
  assert.equal(address.userId, undefined, "must not expose userId");
});

test("invalid address input is rejected", async () => {
  const res = await agentA.post("/api/addresses").send({ line1: "", city: "", pincode: "12" });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test("a user only sees their own addresses", async () => {
  const mine = await agentA.get("/api/addresses");
  assert.equal(mine.status, 200);
  const before = mine.body.data.total;

  const theirs = await agentB.post("/api/addresses").send(validAddress({ label: "Work" }));
  assert.equal(theirs.status, 201);

  const after = await agentA.get("/api/addresses");
  assert.equal(after.body.data.total, before, "user A's list must not grow when user B adds an address");

  const bList = await agentB.get("/api/addresses");
  assert.equal(bList.body.data.total, 1);
  assert.equal(bList.body.data.items[0].label, "Work");
});

test("another user's address cannot be accessed, edited or deleted", async () => {
  const mine = await agentA.post("/api/addresses").send(validAddress({ label: "IDOR" }));
  const myId = mine.body.data.address.id as string;

  assert.equal((await agentB.get(`/api/addresses/${myId}`)).status, 404);
  const edit = await agentB.patch(`/api/addresses/${myId}`).send({ city: "Mysuru" });
  assert.equal(edit.status, 404);
  const del = await agentB.delete(`/api/addresses/${myId}`);
  assert.equal(del.status, 404);

  // Still owned by A afterwards.
  const still = await agentA.get("/api/addresses");
  assert.ok(still.body.data.items.some((a: { id: string }) => a.id === myId));
});

test("creating an address as default sets isDefault", async () => {
  const res = await agentA.post("/api/addresses").send(validAddress({ label: "Default1", isDefault: true }));
  assert.equal(res.status, 201);
  assert.equal(res.body.data.address.isDefault, true);
});

test("setting a new default unsets the previous default (single default per user)", async () => {
  const first = await agentA.post("/api/addresses").send(validAddress({ label: "First", isDefault: true }));
  const firstId = first.body.data.address.id as string;
  assert.equal(first.body.data.address.isDefault, true);

  // Make another address default via the /default endpoint.
  const second = await agentA.post("/api/addresses").send(validAddress({ label: "Second" }));
  const secondId = second.body.data.address.id as string;
  const setDefault = await agentA.patch(`/api/addresses/${secondId}/default`);
  assert.equal(setDefault.status, 200);
  assert.equal(setDefault.body.data.address.isDefault, true);

  // First must now be demoted.
  const list = await agentA.get("/api/addresses");
  const defaults = list.body.data.items.filter((a: { isDefault: boolean }) => a.isDefault);
  assert.equal(defaults.length, 1);
  assert.equal(defaults[0].id, secondId);
  assert.equal(list.body.data.items.find((a: { id: string }) => a.id === firstId).isDefault, false);
});

test("editing an address to default demotes the previous default", async () => {
  const a = await agentA.post("/api/addresses").send(validAddress({ label: "EditA" }));
  const b = await agentA.post("/api/addresses").send(validAddress({ label: "EditB" }));
  const aId = a.body.data.address.id as string;
  const bId = b.body.data.address.id as string;

  await agentA.patch(`/api/addresses/${aId}/default`);
  const edited = await agentA.patch(`/api/addresses/${bId}`).send({ isDefault: true });
  assert.equal(edited.body.data.address.isDefault, true);

  const list = await agentA.get("/api/addresses");
  const defaults = list.body.data.items.filter((x: { isDefault: boolean }) => x.isDefault);
  assert.equal(defaults.length, 1);
  assert.equal(defaults[0].id, bId);
});

test("editing an address updates fields", async () => {
  const res = await agentA.post("/api/addresses").send(validAddress({ label: "Before" }));
  const id = res.body.data.address.id as string;
  const edit = await agentA.patch(`/api/addresses/${id}`).send({ label: "After", city: "Mysuru" });
  assert.equal(edit.status, 200);
  assert.equal(edit.body.data.address.label, "After");
  assert.equal(edit.body.data.address.city, "Mysuru");
  assert.equal(edit.body.data.address.line1, "12 Lake View Rd", "untouched fields preserved");
});

test("deleting an address works", async () => {
  const res = await agentA.post("/api/addresses").send(validAddress({ label: "DeleteMe" }));
  const id = res.body.data.address.id as string;
  const del = await agentA.delete(`/api/addresses/${id}`);
  assert.equal(del.status, 200);
  assert.equal(del.body.data.deleted, true);

  const list = await agentA.get("/api/addresses");
  assert.equal(list.body.data.items.some((a: { id: string }) => a.id === id), false);
});

test("booking address snapshot remains unchanged after the saved address is modified", async () => {
  // Fixture: test + lab + offering (mirrors booking.test.ts).
  const category = await Category.create({ name: "Blood", slug: "blood-addr", description: "B" });
  const test = await Test.create({
    slug: "addr-cbc",
    name: "Address CBC",
    description: "CBC",
    categoryId: category._id,
    sampleType: "Blood",
    reportTime: 6,
    reportTimeUnit: "hours",
    isActive: true,
  });
  const lab = await Lab.create({
    name: "Addr Lab",
    slug: "addr-lab",
    city: "Bengaluru",
    address: "MG Road",
    homeCollection: true,
    contact: { phone: "9876512345", email: "lab@example.com" },
    status: "active",
  });
  const offering = await LabTestOffering.create({
    labId: lab._id,
    testId: test._id,
    price: 300,
    homeCollection: true,
    homeCollectionAvailability: "available",
    collectionFee: 50,
    reportTime: 24,
    reportTimeUnit: "hours",
    availability: "available",
  });

  // Save an address, then book home collection with its details.
  const saved = await agentA.post("/api/addresses").send(validAddress({ label: "Snapshot Home" }));
  const savedAddr = saved.body.data.address;
  const booking = await agentA.post("/api/bookings").send({
    testId: test._id.toString(),
    labId: lab._id.toString(),
    labTestOfferingId: offering._id.toString(),
    collectionMethod: "home_collection",
    appointmentDate: "2026-09-20",
    appointmentTime: "9:00 AM - 12:00 PM",
    patient: { name: "Snapshot Patient", phone: "9876543210" },
    address: {
      line1: savedAddr.line1,
      line2: savedAddr.line2,
      locality: savedAddr.locality,
      city: savedAddr.city,
      state: savedAddr.state,
      pincode: savedAddr.pincode,
    },
  });
  assert.equal(booking.status, 201);
  const bookingId = booking.body.data.booking.id as string;

  // Modify and even delete the saved address afterwards.
  await agentA.patch(`/api/addresses/${savedAddr.id}`).send({ city: "Mysuru", line1: "Changed Street" });
  await agentA.delete(`/api/addresses/${savedAddr.id}`);

  // The booking must still show the ORIGINAL address snapshot.
  const detail = await agentA.get(`/api/bookings/${bookingId}`);
  assert.equal(detail.status, 200);
  const snapshot = detail.body.data.booking.address;
  assert.equal(snapshot.line1, savedAddr.line1);
  assert.equal(snapshot.locality, savedAddr.locality);
  assert.equal(snapshot.city, savedAddr.city);
  assert.equal(snapshot.pincode, savedAddr.pincode);
});
