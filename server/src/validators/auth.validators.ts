import { EMAIL_RE, isValidPhone } from "../models/validators.js";

export interface SignupInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ValidationErrors {
  errors: Record<string, string>;
  isValid: boolean;
}

function fieldErrors(errors: Record<string, string>): ValidationErrors {
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateSignup(input: Partial<SignupInput>): ValidationErrors {
  const errors: Record<string, string> = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) errors.name = "Please enter your full name.";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (input.phone !== undefined && input.phone !== "") {
    if (!isValidPhone(input.phone)) errors.phone = "Use a valid 10-digit mobile number.";
  }

  const password = typeof input.password === "string" ? input.password : "";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";

  return fieldErrors(errors);
}

export function validateLogin(input: Partial<LoginInput>): ValidationErrors {
  const errors: Record<string, string> = {};

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  const password = typeof input.password === "string" ? input.password : "";
  if (!password) errors.password = "Password is required.";

  return fieldErrors(errors);
}
