import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareTests,
  emptyOfferingStats,
  escapeRegExp,
  matchesTestQuery,
  offeringReportTimeLabel,
  testHomeCollectionAvailability,
  testSearchHaystack,
} from "../src/services/catalogue.service.js";

test("testHomeCollectionAvailability aggregates offering tri-states", () => {
  assert.equal(testHomeCollectionAvailability(emptyOfferingStats()), "unavailable");

  assert.equal(
    testHomeCollectionAvailability({ count: 2, minPrice: 100, availableHome: 2, labDependentHome: 0, unavailableHome: 0 }),
    "available",
  );
  assert.equal(
    testHomeCollectionAvailability({ count: 3, minPrice: 100, availableHome: 2, labDependentHome: 0, unavailableHome: 1 }),
    "lab-dependent",
  );
  assert.equal(
    testHomeCollectionAvailability({ count: 2, minPrice: 100, availableHome: 0, labDependentHome: 2, unavailableHome: 0 }),
    "lab-dependent",
  );
  assert.equal(
    testHomeCollectionAvailability({ count: 2, minPrice: 100, availableHome: 0, labDependentHome: 0, unavailableHome: 2 }),
    "unavailable",
  );
});

test("offeringReportTimeLabel formats numeric report times for display", () => {
  assert.equal(offeringReportTimeLabel(24, "hours"), "24 hours");
  assert.equal(offeringReportTimeLabel(2, "hours"), "2 hours");
  assert.equal(offeringReportTimeLabel(1, "hours"), "1 hour");
  assert.equal(offeringReportTimeLabel(2, "days"), "2 days");
  assert.equal(offeringReportTimeLabel(1, "days"), "1 day");
});

test("testSearchHaystack and matchesTestQuery mirror the frontend search", () => {
  const input = {
    name: "Complete Blood Count",
    shortName: "CBC",
    description: "Haemoglobin, total counts and indices",
    sampleType: "Blood",
    tags: ["haematology"],
    parameters: ["Hb", "TLC"],
    categoryName: "Blood Tests",
  };

  const haystack = testSearchHaystack(input);
  assert.ok(haystack.includes("complete blood count"));
  assert.ok(haystack.includes("blood tests"));
  assert.ok(haystack.includes("haematology"));
  assert.ok(haystack.includes("tlc"));

  assert.equal(matchesTestQuery(input, ""), true);
  assert.equal(matchesTestQuery(input, "cbc"), true);
  assert.equal(matchesTestQuery(input, "blood"), true);
  // Multi-token AND matching, same as the demo layer.
  assert.equal(matchesTestQuery(input, "blood count"), true);
  assert.equal(matchesTestQuery(input, "vitamin d"), false);
});

test("compareTests matches the frontend sort orderings", () => {
  const popularA = { name: "Alpha", popular: true, price: 200 };
  const popularB = { name: "Beta", popular: true, price: 100 };
  const normalC = { name: "Gamma", popular: false, price: 50 };

  assert.ok(compareTests(popularA, normalC, "popular") < 0, "popular tests come first");
  assert.ok(compareTests(popularA, popularB, "name-asc") < 0, "name ascending");
  assert.ok(compareTests(normalC, popularB, "price-asc") < 0, "price ascending");
  assert.ok(compareTests(popularB, normalC, "price-desc") < 0, "price descending");
});

test("escapeRegExp escapes regex metacharacters in user input", () => {
  // Assertions built via RegExp so the test source needs no literal escapes.
  assert.match("Sector 35-B", new RegExp("^" + escapeRegExp("Sector 35-B") + "$"));
  assert.doesNotMatch("Sector 35XB", new RegExp("^" + escapeRegExp("Sector 35-B") + "$"));
  assert.match("a.b[c]", new RegExp("^" + escapeRegExp("a.b[c]") + "$"));
  assert.equal(escapeRegExp("plain"), "plain");
});
