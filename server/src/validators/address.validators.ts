import { isValidPincode } from "../models/validators.js";

export interface AddressInput {
  label?: string;
  line1: string;
  line2?: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface ValidationResult {
  errors: Record<string, string>;
  isValid: boolean;
}

function result(errors: Record<string, string>): ValidationResult {
  return { errors, isValid: Object.keys(errors).length === 0 };
}

/** Validates a create/update address payload (all fields optional on update). */
export function validateAddress(input: Partial<AddressInput>, { partial = false }: { partial?: boolean } = {}): ValidationResult {
  const errors: Record<string, string> = {};

  const line1 = typeof input.line1 === "string" ? input.line1.trim() : "";
  if (line1 !== "" && !line1) errors.line1 = "Address line 1 is required.";
  if (!partial && !line1) errors.line1 = "Address line 1 is required.";
  else if (partial && input.line1 !== undefined && !line1) errors.line1 = "Address line 1 cannot be empty.";

  const city = typeof input.city === "string" ? input.city.trim() : "";
  if (!partial && !city) errors.city = "City is required.";
  else if (partial && input.city !== undefined && !city) errors.city = "City cannot be empty.";

  const state = typeof input.state === "string" ? input.state.trim() : "";
  if (!partial && !state) errors.state = "State is required.";
  else if (partial && input.state !== undefined && !state) errors.state = "State cannot be empty.";

  if (input.pincode !== undefined) {
    if (!isValidPincode(input.pincode)) errors.pincode = "Enter a valid 6-digit pincode.";
  } else if (!partial) {
    errors.pincode = "Pincode is required.";
  }

  if (input.isDefault !== undefined && typeof input.isDefault !== "boolean") {
    errors.isDefault = "isDefault must be a boolean.";
  }

  return result(errors);
}
