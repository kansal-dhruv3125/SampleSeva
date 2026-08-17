import type { Booking } from "../types";

/**
 * LEGACY demo bookings (Phases 4B–5G).
 *
 * The booking system now persists to MongoDB through the real Booking API
 * (see src/lib/api.ts) — localStorage is no longer the source of truth.
 *
 * This module ONLY provides read access to previously stored demo bookings
 * so the old data is never silently destroyed and any compatibility code is
 * clearly isolated. Nothing in the active UI reads from here.
 */

const LEGACY_STORAGE_KEY = "sampleseva.demo-bookings";

/** Read-only access to pre-API demo bookings, newest first. Returns [] when none exist. */
export function getLegacyLocalBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  } catch {
    return [];
  }
}
