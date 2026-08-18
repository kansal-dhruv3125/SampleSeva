/**
 * Barrel + helpers for all demo data.
 *
 * UI components should import from here (or the individual modules) — test
 * names, prices and lab details should never be hard-coded in components.
 */

export * from "./categories";
export * from "./tests";
export * from "./packages";
export * from "./labs";
export * from "./locations";

/** Format a number as Indian Rupees, e.g. 1199 -> "₹1,199". */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
