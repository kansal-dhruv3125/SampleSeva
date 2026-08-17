import type { SavedAddress } from "../types";

/**
 * LEGACY demo saved addresses (Phases 4B–5H).
 *
 * Addresses now persist to MongoDB through the real Address API
 * (see src/lib/api.ts) — localStorage is no longer the source of truth.
 *
 * This module ONLY provides read access to previously stored demo addresses
 * so the old data is never silently destroyed and any compatibility code is
 * clearly isolated. Nothing in the active UI reads from here.
 */

const LEGACY_STORAGE_KEY = "sampleseva.demo-addresses";

/** Read-only access to pre-API demo addresses. Returns [] when none exist. */
export function getLegacyLocalAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedAddress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
