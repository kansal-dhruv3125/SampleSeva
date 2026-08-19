/**
 * Shared domain types for SampleSeva.
 *
 * These mirror the shape the backend will expose in later phases, so the
 * demo data in src/data can be swapped for API responses without touching
 * the UI components.
 */

export type SampleType =
  | "Blood"
  | "Urine"
  | "Stool"
  | "Semen"
  | "Saliva"
  | "Swab"
  | "Sputum"
  | "Other";

export type HomeCollectionAvailability = "available" | "unavailable" | "lab-dependent";

export type TestGender = "all" | "male" | "female";

export type TestAgeGroup = "all" | "child" | "adult" | "senior";

export type TestStatus = "active" | "inactive";

export type ReportTimeUnit = "hours" | "days";
export type PreparationInstruction = string;
export type ReportTimeValue =
  | number
  | "Same day"
  | "24 hours"
  | "48 hours"
  | `${number} hours`
  | `${number} days`;

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Key into the icon map in src/components/cards/CategoryCard.tsx */
  icon: string;
  popular?: boolean;
  /** Backend-computed catalogue counts (Phase 5F); demo data computes locally. */
  testCount?: number;
  packageCount?: number;
}

export interface Test {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  /** Primary category id */
  category?: string;
  /** Legacy demo data can still use categoryIds */
  categoryIds?: string[];
  subcategory?: string;
  /** All category ids this test appears under (includes primary) */
  categories?: string[];
  description: string;
  /** Primary sample type for display */
  sampleType: SampleType;
  sampleTypes?: SampleType[];
  /** Canonical home-collection state */
  homeCollectionAvailability?: HomeCollectionAvailability;
  /** Legacy compatibility */
  homeCollectionAvailable?: HomeCollectionAvailability;
  /** Legacy flat demo field */
  homeCollection?: boolean;
  /** Legacy flat demo field */
  fasting?: string;
  fastingRequired?: boolean;
  fastingHours?: number;
  /** Legacy flat demo field */
  preparation?: PreparationInstruction[];
  preparationInstructions?: PreparationInstruction[];
  reportTime: ReportTimeValue;
  reportTimeUnit?: ReportTimeUnit;
  /** Upper bound for ranges such as 2–3 days (demo estimate) */
  reportTimeEnd?: number;
  parameters?: string[];
  /** Legacy demo data can still use startingPrice */
  startingPrice?: number;
  /** Phase 2 catalogue uses priceFrom */
  priceFrom?: number;
  popular?: boolean;
  gender?: TestGender;
  ageGroup?: TestAgeGroup;
  tags?: string[];
  status?: TestStatus;
}

export interface HealthPackage {
  id: string;
  slug: string;
  name: string;
  testsCount: number;
  description: string;
  startingPrice: number;
  homeCollection?: boolean;
  homeCollectionAvailability?: HomeCollectionAvailability;
  popular?: boolean;
  /** Test ids/slugs included in this package (demo) */
  includedTests?: string[];
  highlights?: string[];
}

export interface Lab {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  phone: string;
  email: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  /** Demo opening hours as string, e.g. "6:30 AM - 10:00 PM" */
  openingHours: string;
  /** Services offered by the lab */
  services: string[];
  homeCollection: boolean;
  /** For demo UI only — not real accreditation */
  verified: boolean;
  status: "active" | "inactive";
  /** Legacy fields for backward compatibility */
  distanceKm?: number;
  reviews?: number;
  testsOffered?: number;
  priceNote?: string;
  about?: string;
}

export interface LabTestOffering {
  id: string;
  labId: string;
  testId: string;
  /** Real database ObjectIds exposed for the booking API (labId/testId are slugs). */
  labObjectId?: string;
  testObjectId?: string;
  price: number;
  homeCollectionAvailability: HomeCollectionAvailability;
  reportTime: ReportTimeValue;
  reportTimeUnit?: ReportTimeUnit;
  available: boolean;
  popular?: boolean;
  discountPercentage?: number;
  collectionFee?: number;
}

export interface Location {
  id: string;
  name: string;
  region: string;
  /** Number of labs listed in this city (demo) */
  labCount: number;
}

export interface BookingIntent {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  collection: "home" | "visit";
}

export type BookingCollectionMode = "home" | "lab";
export type BookingGender = "male" | "female" | "other" | "prefer-not-to-say";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface BookingAddress {
  line1: string;
  line2?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
}

/**
 * Authenticated customer profile returned by the Phase 5G auth API.
 * The password hash never leaves the server — only these safe fields.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "customer" | "lab" | "admin";
  createdAt: string;
}

/** A saved home-collection address attached to a customer account. */
export interface SavedAddress extends BookingAddress {
  id: string;
  /** Optional friendly label, e.g. "Home" or "Work" */
  label?: string;
  /** True when this is the user's single default collection address. */
  isDefault?: boolean;
}

export interface BookingPatient {
  fullName: string;
  dob?: string;
  gender?: BookingGender;
  phone: string;
  email?: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  testId: string;
  labId: string;
  testName: string;
  labName: string;
  testSlug?: string;
  labSlug?: string;
  amount: number;
  collectionFee: number;
  preferredDate: string;
  preferredTime: string;
  collectionMode: BookingCollectionMode;
  patient: BookingPatient;
  address?: BookingAddress;
  notes?: string;
  expectedReportTime: string;
}

export interface BookingFormValues {
  testId: string;
  testName: string;
  labId: string;
  labName: string;
  testSlug?: string;
  labSlug?: string;
  patientName: string;
  dob?: string;
  gender: BookingGender;
  phone: string;
  email: string;
  collectionMode: BookingCollectionMode;
  preferredDate: string;
  preferredTime: string;
  address: BookingAddress;
  notes: string;
  amount: number;
  collectionFee: number;
  expectedReportTime: string;
}

export interface BookingSummary {
  id: string;
  reference: string;
  testName: string;
  labName: string;
  preferredDate: string;
  preferredTime: string;
  status: BookingStatus;
  amount: number;
  collectionMode: BookingCollectionMode;
}

export type TestSortOption = "popular" | "price-asc" | "price-desc" | "name-asc";

export interface TestFilterParams {
  category?: string;
  sampleType?: SampleType;
  /** When true, matches available + lab-dependent; when false, unavailable only */
  homeCollection?: boolean;
  fastingRequired?: boolean;
  popular?: boolean;
  priceMin?: number;
  priceMax?: number;
  query?: string;
  sort?: TestSortOption;
}
