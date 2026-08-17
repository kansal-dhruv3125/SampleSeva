import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { normalizePhone, serializeUser } from "../utils/auth.js";
import type { SafeUser } from "../utils/auth.js";
import type { LoginInput, SignupInput } from "../validators/auth.validators.js";

const BCRYPT_ROUNDS = 10;

function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof mongoose.mongo.MongoServerError && err.code === 11000;
}

/** Finds a user by normalized email or returns null. */
export async function findUserByEmail(email: string): Promise<{ _id: mongoose.Types.ObjectId } | null> {
  return User.findOne({ email: email.trim().toLowerCase() }).select("_id").lean();
}

/**
 * Creates a new customer account (auto sign-in): hashes the password,
 * persists the user, and returns the safe profile. Throws ApiError on
 * validation/duplicate issues.
 */
export async function signupUser(input: SignupInput): Promise<SafeUser> {
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);

  if (await findUserByEmail(email)) {
    throw new ApiError(409, "An account with this email already exists. Try signing in instead.", "EmailTaken");
  }
  if (phone && (await User.findOne({ phone }).select("_id").lean())) {
    throw new ApiError(409, "An account with this mobile number already exists.", "PhoneTaken");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({
    name: input.name.trim(),
    email,
    ...(phone ? { phone } : {}),
    passwordHash,
    role: "customer",
  });

  return serializeUser(user);
}

/**
 * Authenticates a user by email + password. Throws ApiError(401) for
 * unknown accounts and wrong passwords.
 */
export async function loginUser(input: LoginInput): Promise<SafeUser> {
  const user = await User.findOne({ email: input.email.trim().toLowerCase() }).lean();
  if (!user) {
    throw new ApiError(401, "No account found with this email address.", "InvalidCredentials");
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, "Incorrect password. Please try again.", "InvalidCredentials");
  }

  return serializeUser(user);
}

/** Loads a user by id (for GET /api/auth/me). Throws 401 when missing. */
export async function getUserById(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError(401, "Authentication required. Please sign in.", "Unauthorized");
  }
  return serializeUser(user);
}

export { isDuplicateKeyError };
