import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

/**
 * Schema-level model tests — pure validation, no database connection needed.
 * Unique constraints are verified at the schema/index definition level here;
 * live duplicate rejection is verified separately against a throwaway local
 * MongoDB (never the real Atlas database).
 */
const { User, Address, Category, Test, Package, Lab, LabTestOffering, Booking } =
  await import("../src/models/index.js");

const oid = () => new mongoose.Types.ObjectId();

function hasUniqueIndex(model: mongoose.Model<unknown>, field: string): boolean {
  return model.schema
    .indexes()
    .some(([spec, opts]) => Object.keys(spec).includes(field) && opts.unique);
}

// --- Registration -----------------------------------------------------------

test("all models are registered", () => {
  for (const m of [User, Address, Category, Test, Package, Lab, LabTestOffering, Booking]) {
    assert.equal(typeof m, "function");
  }
});

// --- User -------------------------------------------------------------------

test("User: valid document passes validation", () => {
  const user = new User({ name: "Demo User", email: "demo@example.com", phone: "9876543210", passwordHash: "hash" });
  assert.equal(user.validateSync(), undefined);
});

test("User: email is normalized to lowercase and trimmed", () => {
  const user = new User({ name: "Demo", email: "  Demo@Example.COM ", phone: "9876543210", passwordHash: "h" });
  assert.equal(user.email, "demo@example.com");
});

test("User: missing required fields fail validation", () => {
  const err = new User({}).validateSync();
  assert.ok(err);
  // phone is intentionally optional (matches the existing signup UX where the
  // mobile number field is not required) — it must not be in the required list.
  for (const f of ["name", "email", "passwordHash"]) {
    assert.ok(err.errors[f], `expected error on ${f}`);
  }
  assert.equal(err.errors["phone"], undefined);
});

test("User: phone may be omitted", () => {
  const user = new User({ name: "Demo", email: "demo@example.com", passwordHash: "hash" });
  assert.equal(user.validateSync(), undefined);
});

test("User: invalid role is rejected", () => {
  const user = new User({ name: "A", email: "a@b.co", phone: "9876543210", passwordHash: "h", role: "admin" });
  assert.ok(user.validateSync()?.errors["role"]);
});

test("User: invalid email is rejected", () => {
  const user = new User({ name: "A", email: "not-an-email", phone: "9876543210", passwordHash: "h" });
  assert.ok(user.validateSync()?.errors["email"]);
});

test("User: invalid phone is rejected", () => {
  const user = new User({ name: "A", email: "a@b.co", phone: "12345", passwordHash: "h" });
  assert.ok(user.validateSync()?.errors["phone"]);
});

test("User: phone accepts +91 prefix and spacing", () => {
  const user = new User({ name: "A", email: "a@b.co", phone: "+91 98765 43210", passwordHash: "h" });
  assert.equal(user.validateSync(), undefined);
});

test("User: default role is customer", () => {
  const user = new User({ name: "A", email: "a@b.co", phone: "9876543210", passwordHash: "h" });
  assert.equal(user.role, "customer");
});

test("User: email and phone have unique indexes", () => {
  assert.ok(hasUniqueIndex(User, "email"));
  assert.ok(hasUniqueIndex(User, "phone"));
});

// --- Address ----------------------------------------------------------------

test("Address: valid document passes validation", () => {
  const a = new Address({ userId: oid(), addressLine1: "Plot 42", city: "Rajpura", state: "Punjab", pincode: "140401" });
  assert.equal(a.validateSync(), undefined);
});

test("Address: missing required fields fail validation", () => {
  const err = new Address({}).validateSync();
  for (const f of ["userId", "addressLine1", "city", "state", "pincode"]) {
    assert.ok(err?.errors[f], `expected error on ${f}`);
  }
});

test("Address: invalid pincode is rejected", () => {
  const a = new Address({ userId: oid(), addressLine1: "1", city: "C", state: "S", pincode: "12" });
  assert.ok(a.validateSync()?.errors["pincode"]);
});

test("Address: isDefault defaults to false", () => {
  const a = new Address({ userId: oid(), addressLine1: "1", city: "C", state: "S", pincode: "140401" });
  assert.equal(a.isDefault, false);
});

test("Address: userId is an ObjectId ref to User and indexed", () => {
  const p = Address.schema.path("userId");
  assert.ok(p instanceof mongoose.Schema.Types.ObjectId);
  assert.equal(p.options.ref, "User");
  assert.ok(Address.schema.indexes().some(([s]) => Object.keys(s).includes("userId")));
});

test("Address: partial unique index supports one default per user", () => {
  const idx = Address.schema.indexes().find(([s]) => s.userId && s.isDefault);
  assert.ok(idx);
  assert.equal(idx![1].unique, true);
  assert.deepEqual(idx![1].partialFilterExpression, { isDefault: true });
});

// --- Category ---------------------------------------------------------------

test("Category: valid document passes validation", () => {
  const c = new Category({ name: "Blood Tests", slug: "blood-tests" });
  assert.equal(c.validateSync(), undefined);
});

test("Category: missing name/slug fail validation", () => {
  const err = new Category({}).validateSync();
  assert.ok(err?.errors["name"]);
  assert.ok(err?.errors["slug"]);
});

test("Category: isActive defaults to true and slug is unique", () => {
  assert.equal(new Category({ name: "n", slug: "s" }).isActive, true);
  assert.ok(hasUniqueIndex(Category, "slug"));
});

// --- Test -------------------------------------------------------------------

const catId = oid();
const validTest = () =>
  new Test({ slug: "cbc", name: "CBC", description: "d", categoryId: catId, sampleType: "Blood", reportTime: 6, reportTimeUnit: "hours" });

test("Test: valid document passes validation", () => {
  assert.equal(validTest().validateSync(), undefined);
});

test("Test: missing required fields fail validation", () => {
  const err = new Test({}).validateSync();
  for (const f of ["slug", "name", "description", "categoryId", "sampleType", "reportTime", "reportTimeUnit"]) {
    assert.ok(err?.errors[f], `expected error on ${f}`);
  }
});

test("Test: invalid reportTimeUnit and sampleType are rejected", () => {
  const t1 = validTest();
  t1.reportTimeUnit = "parsecs";
  assert.ok(t1.validateSync()?.errors["reportTimeUnit"]);
  const t2 = validTest();
  t2.sampleType = "Plasma";
  assert.ok(t2.validateSync()?.errors["sampleType"]);
});

test("Test: negative fastingHours is rejected", () => {
  const t = validTest();
  t.fastingHours = -2;
  assert.ok(t.validateSync()?.errors["fastingHours"]);
});

test("Test: fastingRequired/popular/isActive default correctly", () => {
  const t = validTest();
  assert.equal(t.fastingRequired, false);
  assert.equal(t.popular, false);
  assert.equal(t.isActive, true);
});

test("Test: categoryId is an ObjectId ref to Category", () => {
  assert.equal(Test.schema.path("categoryId").options.ref, "Category");
});

test("Test: indexes (slug unique, categoryId, sampleType, isActive+popular)", () => {
  const idx = Test.schema.indexes();
  assert.ok(idx.some(([s, o]) => Object.keys(s).includes("slug") && o.unique));
  assert.ok(idx.some(([s]) => Object.keys(s).includes("categoryId")));
  assert.ok(idx.some(([s]) => Object.keys(s).includes("sampleType")));
  assert.ok(idx.some(([s]) => s.isActive && s.popular));
});

// --- Package ----------------------------------------------------------------

test("Package: valid document passes validation", () => {
  const p = new Package({ slug: "basic", name: "Basic", includedTests: [oid()], price: 1199 });
  assert.equal(p.validateSync(), undefined);
});

test("Package: missing price fails validation (includedTests defaults to [])", () => {
  const err = new Package({ slug: "p", name: "P" }).validateSync();
  assert.ok(err?.errors["price"]);
  // includedTests is required-with-default, so a missing value is allowed and
  // defaults to [] rather than failing validation.
  assert.deepEqual(new Package({ slug: "p", name: "P" }).includedTests, []);
});

test("Package: negative price is rejected", () => {
  const p = new Package({ slug: "p", name: "P", includedTests: [], price: -5 });
  assert.ok(p.validateSync()?.errors["price"]);
});

test("Package: includedTests references Test and slug is unique", () => {
  const p = Package.schema.path("includedTests");
  assert.equal((p.options as { ref?: string }).ref, "Test");
  assert.ok(hasUniqueIndex(Package, "slug"));
});

// --- Lab --------------------------------------------------------------------

const validLab = () =>
  new Lab({ name: "CityLab", slug: "citylab", city: "Rajpura", address: "addr", contact: { phone: "9876543210", email: "lab@example.com" } });

test("Lab: valid document passes validation", () => {
  assert.equal(validLab().validateSync(), undefined);
});

test("Lab: missing name/slug/city/contact fail validation", () => {
  const err = new Lab({}).validateSync();
  for (const f of ["name", "slug", "city", "contact"]) {
    assert.ok(err?.errors[f], `expected error on ${f}`);
  }
});

test("Lab: invalid status, rating and reviewCount are rejected", () => {
  const l1 = validLab();
  l1.status = "closed";
  assert.ok(l1.validateSync()?.errors["status"]);
  const l2 = validLab();
  l2.rating = 6;
  assert.ok(l2.validateSync()?.errors["rating"]);
  const l3 = validLab();
  l3.reviewCount = -1;
  assert.ok(l3.validateSync()?.errors["reviewCount"]);
});

test("Lab: invalid contact phone is rejected", () => {
  const l = validLab();
  l.contact.phone = "123";
  assert.ok(l.validateSync()?.errors["contact.phone"]);
});

test("Lab: status defaults to active and indexes exist", () => {
  assert.equal(validLab().status, "active");
  const idx = Lab.schema.indexes();
  assert.ok(idx.some(([s, o]) => Object.keys(s).includes("slug") && o.unique));
  assert.ok(idx.some(([s]) => Object.keys(s).includes("city")));
});

// --- LabTestOffering ---------------------------------------------------------

const validOffering = () =>
  new LabTestOffering({ labId: oid(), testId: oid(), price: 229, reportTime: 24, reportTimeUnit: "hours" });

test("LabTestOffering: valid document passes validation", () => {
  assert.equal(validOffering().validateSync(), undefined);
});

test("LabTestOffering: missing required fields fail validation", () => {
  const err = new LabTestOffering({}).validateSync();
  for (const f of ["labId", "testId", "price", "reportTime", "reportTimeUnit"]) {
    assert.ok(err?.errors[f], `expected error on ${f}`);
  }
});

test("LabTestOffering: negative price and collectionFee are rejected", () => {
  const o1 = validOffering();
  o1.price = -1;
  assert.ok(o1.validateSync()?.errors["price"]);
  const o2 = validOffering();
  o2.collectionFee = -10;
  assert.ok(o2.validateSync()?.errors["collectionFee"]);
});

test("LabTestOffering: invalid availability/reportTimeUnit are rejected", () => {
  const o1 = validOffering();
  o1.availability = "maybe";
  assert.ok(o1.validateSync()?.errors["availability"]);
  const o2 = validOffering();
  o2.reportTimeUnit = "weeks";
  assert.ok(o2.validateSync()?.errors["reportTimeUnit"]);
});

test("LabTestOffering: isActive defaults true, refs and compound unique index", () => {
  assert.equal(validOffering().isActive, true);
  assert.equal(LabTestOffering.schema.path("labId").options.ref, "Lab");
  assert.equal(LabTestOffering.schema.path("testId").options.ref, "Test");
  const idx = LabTestOffering.schema.indexes().find(([s]) => s.labId && s.testId);
  assert.ok(idx);
  assert.equal(idx![1].unique, true);
});

// --- Booking -----------------------------------------------------------------

const validBooking = () =>
  new Booking({
    bookingReference: "SS-12345678-ABCD",
    userId: oid(),
    testId: oid(),
    labId: oid(),
    labTestOfferingId: oid(),
    collectionMethod: "home_collection",
    appointmentDate: "2026-08-20",
    appointmentTime: "07:30 AM - 08:30 AM",
    patient: { name: "Demo User", phone: "9876543210", age: 30, gender: "male" },
    addressSnapshot: { addressLine1: "Plot 42", city: "Rajpura", state: "Punjab", pincode: "140401" },
    priceBreakdown: { testPrice: 229, collectionFee: 0, discount: 0, total: 229 },
  });

test("Booking: valid document passes validation", () => {
  assert.equal(validBooking().validateSync(), undefined);
});

test("Booking: missing required fields fail validation", () => {
  const err = new Booking({}).validateSync();
  for (const f of ["bookingReference", "userId", "testId", "labId", "labTestOfferingId", "collectionMethod", "appointmentDate", "appointmentTime", "patient", "priceBreakdown"]) {
    assert.ok(err?.errors[f], `expected error on ${f}`);
  }
});

test("Booking: invalid collectionMethod/status/appointmentDate are rejected", () => {
  const b1 = validBooking();
  b1.collectionMethod = "drive-thru";
  assert.ok(b1.validateSync()?.errors["collectionMethod"]);
  const b2 = validBooking();
  b2.status = "refunded";
  assert.ok(b2.validateSync()?.errors["status"]);
  const b3 = validBooking();
  b3.appointmentDate = "20-08-2026";
  assert.ok(b3.validateSync()?.errors["appointmentDate"]);
});

test("Booking: patient subdocument is validated", () => {
  const b = validBooking();
  b.set("patient", { name: "", phone: "" });
  const err = b.validateSync();
  assert.ok(err?.errors["patient.name"]);
  assert.ok(err?.errors["patient.phone"]);
});

test("Booking: addressSnapshot pincode and priceBreakdown totals are validated", () => {
  const b1 = validBooking();
  b1.set("addressSnapshot.pincode", "12");
  assert.ok(b1.validateSync()?.errors["addressSnapshot.pincode"]);
  const b2 = validBooking();
  b2.set("priceBreakdown.total", -1);
  assert.ok(b2.validateSync()?.errors["priceBreakdown.total"]);
});

test("Booking: status defaults pending, cancelledAt/completedAt default null", () => {
  const b = validBooking();
  assert.equal(b.status, "pending");
  assert.equal(b.cancelledAt, null);
  assert.equal(b.completedAt, null);
});

test("Booking: references are correctly typed", () => {
  assert.equal(Booking.schema.path("userId").options.ref, "User");
  assert.equal(Booking.schema.path("testId").options.ref, "Test");
  assert.equal(Booking.schema.path("labId").options.ref, "Lab");
  assert.equal(Booking.schema.path("labTestOfferingId").options.ref, "LabTestOffering");
});

test("Booking: bookingReference unique + userId/createdAt compound index", () => {
  assert.ok(hasUniqueIndex(Booking, "bookingReference"));
  const idx = Booking.schema.indexes().find(([s]) => s.userId && s.createdAt);
  assert.ok(idx);
});
