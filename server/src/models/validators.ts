/**
 * Shared validation helpers for the SampleSeva models.
 *
 * Validation is deliberately lenient — e.g. Indian phone numbers accept an
 * optional +91 prefix and spacing — so realistic input is not rejected while
 * obvious garbage still fails.
 */

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

export const PINCODE_RE = /^\d{6}$/;

const PHONE_RE = /^(\+91)?[6-9]\d{9}$/;

/** Indian mobile number: optional +91 prefix, then 10 digits starting 6-9. */
export function isValidPhone(value: string): boolean {
  const normalized = String(value).replace(/[\s-]/g, "");
  return PHONE_RE.test(normalized);
}

/** Indian pincode: exactly 6 digits. */
export function isValidPincode(value: string): boolean {
  return PINCODE_RE.test(String(value).trim());
}
