// Phase 5J — full critical-flow regression: signup -> login -> me -> logout,
// addresses (create/set-default), bookings (create/list/detail/cancel), the
// address-snapshot guarantee, and unauthorized/IDOR rejection. Needs MongoDB.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sampleseva-fullflow-test";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";

const { createApp } = await import("../src/app.js");
const { User } = await import("../src/models/User.js");
const { Category } = await import("../src/models/Category.js");
const { Test } = await import("../src/models/Test.js");
const { Lab } = await import("../src/models/Lab.js");
const { LabTestOffering } = await import("../src/models/LabTestOffering.js");
const { Booking } = await import("../src/models/Booking.js");
const { Address } = await import("../src/models/Address.js");

const app = createApp();
const agent = request.agent(app);
const intruder = request.agent(app);

let testId = "";
let labId = "";
let offeringId = "";

const ADDRESS_1 = { label: "Home", line1: "12 Lake View Rd", locality: "Koramangala", city: "Bengaluru", state: "Karnataka", pincode: "560034" };

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI ?? "", { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();

  // Catalogue fixture (mirrors booking/address suites).
  const category = await Category.create({ name: "Blood", slug: "flow-blood", description: "B" });
  const test = await Test.create({
    slug: "flow-cbc",
    name: "Flow CBC",
    description: "CBC",
    categoryId: category._id,
    sampleType: "Blood",
    reportTime: 6,
    reportTimeUnit: "hours",
    isActive: true,
  });
  const lab = await Lab.create({
    name: "Flow Lab",
    slug: "flow-lab",
    city: "Bengaluru",
    address: "MG Road",
    homeCollection: true,
    contact: { phone: "9876512345", email: "flow@example.com" },
    status: "active",
  });
  const offering = await LabTestOffering.create({
    labId: lab._id,
    testId: test._id,
    price: 350,
    homeCollection: true,
    homeCollectionAvailability: "available",
    collectionFee: 40,
    reportTime: 24,
    reportTimeUnit: "hours",
    availability: "available",
  });
  testId = test._id.toString();
  labId = lab._id.toString();
  offeringId = offering._id.toString();
});

after(async () => {
  await mongoose.disconnect();
});

test("full flow: signup -> login -> me -> logout", async () => {
  const signup = await agent.post("/api/auth/signup").send({
    name: "Flow User",
    email: "flow@example.com",
    phone: "9876543210",
    password: "secret123",
  });
  assert.equal(signup.status, 201);
  assert.equal(signup.body.data.user.email, "flow@example.com");
  assert.equal("passwordHash" in signup.body.data.user, false);

  await agent.post("/api/auth/logout");
  const loggedOutMe = await agent.get("/api/auth/me");
  assert.equal(loggedOutMe.status, 401);

  const login = await agent.post("/api/auth/login").send({ email: "flow@example.com", password: "secret123" });
  assert.equal(login.status, 200);

  const me = await agent.get("/api/auth/me");
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, "flow@example.com");
});

test("full flow: create + set default address, then create/list/detail/cancel a booking", async () => {
  // 5. create address
  const addr = await agent.post("/api/addresses").send(ADDRESS_1);
  assert.equal(addr.status, 201);
  const addrId = addr.body.data.address.id as string;

  // 6. set default
  const def = await agent.patch(`/api/addresses/${addrId}/default`);
  assert.equal(def.status, 200);
  assert.equal(def.body.data.address.isDefault, true);

  // 7. create booking (home collection, address snapshot)
  const booking = await agent.post("/api/bookings").send({
    testId,
    labId,
    labTestOfferingId: offeringId,
    collectionMethod: "home_collection",
    appointmentDate: "2026-10-01",
    appointmentTime: "9:00 AM - 12:00 PM",
    patient: { name: "Flow Patient", phone: "9876543210" },
    address: {
      line1: ADDRESS_1.line1,
      line2: undefined,
      locality: ADDRESS_1.locality,
      city: ADDRESS_1.city,
      state: ADDRESS_1.state,
      pincode: ADDRESS_1.pincode,
    },
  });
  assert.equal(booking.status, 201);
  assert.equal(booking.body.data.booking.amount, 350, "server-computed price");
  assert.equal(booking.body.data.booking.collectionFee, 40, "home collection fee applied");
  const bookingId = booking.body.data.booking.id as string;
  const reference = booking.body.data.booking.reference as string;

  // 8. list — only this user's bookings
  const list = await agent.get("/api/bookings");
  assert.equal(list.status, 200);
  assert.equal(list.body.data.total, 1);
  assert.equal(list.body.data.items[0].id, bookingId);

  // 9. retrieve details
  const detail = await agent.get(`/api/bookings/${bookingId}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.booking.reference, reference);
  assert.equal(detail.body.data.booking.status, "pending");

  // 10. cancel
  const cancel = await agent.patch(`/api/bookings/${bookingId}/cancel`);
  assert.equal(cancel.status, 200);
  assert.equal(cancel.body.data.booking.status, "cancelled");
});

test("full flow: editing a saved address after booking leaves the booking snapshot unchanged", async () => {
  const addr = await agent.post("/api/addresses").send({ ...ADDRESS_1, label: "Snapshot" });
  const saved = addr.body.data.address;

  const booking = await agent.post("/api/bookings").send({
    testId,
    labId,
    labTestOfferingId: offeringId,
    collectionMethod: "home_collection",
    appointmentDate: "2026-10-02",
    appointmentTime: "12:00 PM - 4:00 PM",
    patient: { name: "Snap Patient", phone: "9812345678" },
    address: {
      line1: saved.line1,
      line2: undefined,
      locality: saved.locality,
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
    },
  });
  assert.equal(booking.status, 201);
  const bookingId = booking.body.data.booking.id as string;

  // Edit AND delete the saved address.
  await agent.patch(`/api/addresses/${saved.id}`).send({ city: "Mysuru", line1: "Changed Lane" });
  await agent.delete(`/api/addresses/${saved.id}`);

  const detail = await agent.get(`/api/bookings/${bookingId}`);
  const snapshot = detail.body.data.booking.address;
  assert.equal(snapshot.city, saved.city);
  assert.equal(snapshot.line1, saved.line1);
  assert.equal(snapshot.pincode, saved.pincode);
});

test("unauthorized access is rejected across auth/addresses/bookings", async () => {
  const anon = request.agent(app);
  assert.equal((await anon.get("/api/auth/me")).status, 401);
  assert.equal((await anon.get("/api/addresses")).status, 401);
  assert.equal((await anon.get("/api/bookings")).status, 401);
  assert.equal((await anon.post("/api/bookings").send({})).status, 401);
});

test("IDOR: another user cannot read or cancel this user's booking, nor touch their address", async () => {
  await intruder.post("/api/auth/signup").send({
    name: "Intruder",
    email: "intruder@example.com",
    password: "secret123",
  });

  const mine = await agent.post("/api/bookings").send({
    testId,
    labId,
    labTestOfferingId: offeringId,
    collectionMethod: "lab_visit",
    appointmentDate: "2026-10-03",
    appointmentTime: "4:00 PM - 8:00 PM",
    patient: { name: "Mine", phone: "9123456789" },
  });
  const bookingId = mine.body.data.booking.id as string;

  const addr = await agent.post("/api/addresses").send(ADDRESS_1);
  const addrId = addr.body.data.address.id as string;

  assert.equal((await intruder.get(`/api/bookings/${bookingId}`)).status, 404);
  assert.equal((await intruder.patch(`/api/bookings/${bookingId}/cancel`)).status, 404);
  assert.equal((await intruder.delete(`/api/addresses/${addrId}`)).status, 404);
  assert.equal((await intruder.patch(`/api/addresses/${addrId}`).send({ city: "X" })).status, 404);
});
