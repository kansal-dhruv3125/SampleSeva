import { EMAIL_RE, isValidPhone, isValidPincode } from "../models/validators.js";

export type BookingCollectionMethod = "home_collection" | "lab_visit";

export interface BookingAddressInput {
  line1: string;
  line2?: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BookingPatientInput {
  name: string;
  phone: string;
  dob?: string;
  email?: string;
  gender?: string;
}

export interface CreateBookingInput {
  testId: string;
  labId: string;
  labTestOfferingId: string;
  collectionMethod: BookingCollectionMethod;
  appointmentDate: string;
  appointmentTime: string;
  patient: BookingPatientInput;
  address?: BookingAddressInput;
  notes?: string;
}

export interface ValidationResult {
  errors: Record<string, string>;
  isValid: boolean;
}

function result(errors: Record<string, string>): ValidationResult {
  return { errors, isValid: Object.keys(errors).length === 0 };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates the booking-creation payload. Price/collectionFee sent by the
 * client are deliberately ignored here — the service computes them from the
 * lab-test offering on the server.
 */
export function validateCreateBooking(input: Partial<CreateBookingInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.testId || typeof input.testId !== "string") errors.testId = "A test is required.";
  if (!input.labId || typeof input.labId !== "string") errors.labId = "A lab is required.";
  if (!input.labTestOfferingId || typeof input.labTestOfferingId !== "string") {
    errors.labTestOfferingId = "A lab test offering is required.";
  }

  const method = input.collectionMethod;
  if (method !== "home_collection" && method !== "lab_visit") {
    errors.collectionMethod = "Collection method must be home_collection or lab_visit.";
  }

  if (!input.appointmentDate || typeof input.appointmentDate !== "string" || !DATE_RE.test(input.appointmentDate)) {
    errors.appointmentDate = "Appointment date must be a YYYY-MM-DD date.";
  }
  if (!input.appointmentTime || typeof input.appointmentTime !== "string" || !input.appointmentTime.trim()) {
    errors.appointmentTime = "A preferred time slot is required.";
  }

  const patient = input.patient;
  if (!patient || typeof patient !== "object") {
    errors.patient = "Patient details are required.";
  } else {
    const name = typeof patient.name === "string" ? patient.name.trim() : "";
    if (!name) errors["patient.name"] = "Patient name is required.";
    else if (name.length < 2) errors["patient.name"] = "Patient name must be at least 2 characters.";

    const phone = typeof patient.phone === "string" ? patient.phone : "";
    if (!phone) errors["patient.phone"] = "Patient mobile number is required.";
    else if (!isValidPhone(phone)) errors["patient.phone"] = "Use a valid 10-digit mobile number.";

    if (patient.dob !== undefined && patient.dob !== "") {
      if (typeof patient.dob !== "string" || !DATE_RE.test(patient.dob)) {
        errors["patient.dob"] = "Date of birth must be a YYYY-MM-DD date.";
      }
    }
    if (patient.email !== undefined && patient.email !== "") {
      if (typeof patient.email !== "string" || !EMAIL_RE.test(patient.email)) {
        errors["patient.email"] = "Enter a valid email address.";
      }
    }
    if (
      patient.gender !== undefined &&
      patient.gender !== "" &&
      !["male", "female", "other", "prefer-not-to-say"].includes(patient.gender)
    ) {
      errors["patient.gender"] = "Invalid gender value.";
    }
  }

  if (method === "home_collection") {
    const address = input.address;
    if (!address || typeof address !== "object") {
      errors.address = "A collection address is required for home collection.";
    } else {
      if (!address.line1 || typeof address.line1 !== "string" || !address.line1.trim()) {
        errors["address.line1"] = "Address line 1 is required for home collection.";
      }
      if (!address.city || typeof address.city !== "string" || !address.city.trim()) {
        errors["address.city"] = "City is required.";
      }
      if (!address.state || typeof address.state !== "string" || !address.state.trim()) {
        errors["address.state"] = "State is required.";
      }
      if (!address.pincode || !isValidPincode(address.pincode)) {
        errors["address.pincode"] = "Enter a valid 6-digit pincode.";
      }
    }
  }

  return result(errors);
}
