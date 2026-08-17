import "dotenv/config";

/**
 * Centralised environment configuration.
 *
 * Development gets sensible, explicit defaults so the scaffold boots without
 * secrets. Production fails fast with a clear message when required
 * configuration is missing (never silently degrades).
 */

const isProd = process.env.NODE_ENV === "production";

function fail(message: string): never {
  throw new Error(`[config] ${message}`);
}

function readPort(): number {
  const raw = process.env.PORT ?? "4000";
  const port = Number.parseInt(raw, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    fail(`PORT must be an integer between 1 and 65535, got "${raw}"`);
  }
  return port;
}

function readClientUrl(): string {
  const value = process.env.CLIENT_URL;
  if (value) return value;
  if (isProd) {
    fail("CLIENT_URL is required in production (frontend origin for CORS).");
  }
  return "http://localhost:5173";
}

function readMongodbUri(): string {
  const value = process.env.MONGODB_URI;
  if (!value) {
    fail("MONGODB_URI is required (MongoDB Atlas connection string).");
  }
  return value;
}

function readJwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (isProd) {
    if (!value || value.length < 32) {
      fail("JWT_SECRET is required in production and must be at least 32 characters.");
    }
    return value;
  }
  return value ?? "dev-only-insecure-secret";
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd,
  port: readPort(),
  clientUrl: readClientUrl(),
  mongodbUri: readMongodbUri(),
  jwtSecret: readJwtSecret(),
} as const;
