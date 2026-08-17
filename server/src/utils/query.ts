/**
 * Small, strict query-string parsers shared by the catalogue controllers.
 * Unknown/malformed values are ignored (treated as "not provided") so a bad
 * query parameter can never 500 the API.
 */

export function parseBool(value: unknown): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function parseNumber(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "" || !/^-?\d+(\.\d+)?$/.test(value.trim())) {
    return undefined;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
