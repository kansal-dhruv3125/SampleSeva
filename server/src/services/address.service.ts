import mongoose from "mongoose";
import { Address, type IAddress } from "../models/Address.js";
import { ApiError } from "../utils/ApiError.js";
import type { AddressInput } from "../validators/address.validators.js";

/**
 * Address service (Phase 5I).
 *
 * Every query is scoped to the authenticated userId — never trusted from the
 * client. Default-address handling demotes the previous default BEFORE the
 * new write, and the partial unique index {userId, isDefault} on true rows
 * backstops concurrent duplicates (retried on E11000).
 */

export interface SavedAddressDTO {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

function isObjectId(value: string): boolean {
  return mongoose.isValidObjectId(value);
}

function normalize(input: Partial<AddressInput>): Partial<IAddress> {
  return {
    ...(input.label !== undefined ? { label: input.label.trim() || undefined } : {}),
    ...(input.line1 !== undefined ? { addressLine1: input.line1.trim() } : {}),
    ...(input.line2 !== undefined ? { addressLine2: input.line2.trim() || undefined } : {}),
    ...(input.locality !== undefined ? { locality: input.locality.trim() || undefined } : {}),
    ...(input.city !== undefined ? { city: input.city.trim() } : {}),
    ...(input.state !== undefined ? { state: input.state.trim() } : {}),
    ...(input.pincode !== undefined ? { pincode: input.pincode.trim() } : {}),
    ...(input.landmark !== undefined ? { landmark: input.landmark.trim() || undefined } : {}),
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}

export function serializeAddress(address: IAddress & { _id: mongoose.Types.ObjectId }): SavedAddressDTO {
  return {
    id: address._id.toString(),
    ...(address.label ? { label: address.label } : {}),
    line1: address.addressLine1,
    ...(address.addressLine2 ? { line2: address.addressLine2 } : {}),
    ...(address.locality ? { locality: address.locality } : {}),
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: address.isDefault,
  };
}

/** Unsets the user's current default so the new default can take over. */
async function demoteDefaults(userId: mongoose.Types.ObjectId): Promise<void> {
  await Address.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
}

function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof mongoose.mongo.MongoServerError && err.code === 11000;
}

export async function listAddresses(userId: string): Promise<SavedAddressDTO[]> {
  const docs = await Address.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
  return docs.map((doc) => serializeAddress(doc as IAddress & { _id: mongoose.Types.ObjectId }));
}

export async function createAddress(userId: string, input: AddressInput): Promise<SavedAddressDTO> {
  const ownerId = new mongoose.Types.ObjectId(userId);
  const data = normalize(input);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (data.isDefault) await demoteDefaults(ownerId);
    try {
      const doc = await Address.create({ userId: ownerId, ...data });
      return serializeAddress(doc);
    } catch (err) {
      if (isDuplicateKeyError(err)) continue;
      throw err;
    }
  }
  throw new ApiError(409, "Another default address was just set. Please try again.", "DefaultRace");
}

export async function updateAddress(userId: string, id: string, input: Partial<AddressInput>): Promise<SavedAddressDTO> {
  if (!isObjectId(id)) throw new ApiError(404, "Address not found.", "NotFound");
  const ownerId = new mongoose.Types.ObjectId(userId);
  const data = normalize(input);

  // Setting this address as default must first free the previous default.
  if (data.isDefault === true) {
    await demoteDefaults(ownerId);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const doc = await Address.findOneAndUpdate({ _id: id, userId: ownerId }, { $set: data }, { new: true }).lean();
      if (!doc) throw new ApiError(404, "Address not found.", "NotFound");
      return serializeAddress(doc as IAddress & { _id: mongoose.Types.ObjectId });
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        await demoteDefaults(ownerId);
        continue;
      }
      throw err;
    }
  }
  throw new ApiError(409, "Another default address was just set. Please try again.", "DefaultRace");
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  if (!isObjectId(id)) throw new ApiError(404, "Address not found.", "NotFound");
  const doc = await Address.findOneAndDelete({ _id: id, userId: new mongoose.Types.ObjectId(userId) }).lean();
  if (!doc) throw new ApiError(404, "Address not found.", "NotFound");
  // Deleting the default removes it entirely — no other row becomes default,
  // so multiple defaults can never arise from a delete.
}

export async function setDefaultAddress(userId: string, id: string): Promise<SavedAddressDTO> {
  if (!isObjectId(id)) throw new ApiError(404, "Address not found.", "NotFound");
  const ownerId = new mongoose.Types.ObjectId(userId);

  const existing = await Address.findOne({ _id: id, userId: ownerId }).lean();
  if (!existing) throw new ApiError(404, "Address not found.", "NotFound");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await demoteDefaults(ownerId);
    try {
      const doc = await Address.findOneAndUpdate(
        { _id: id, userId: ownerId },
        { $set: { isDefault: true } },
        { new: true },
      ).lean();
      if (!doc) throw new ApiError(404, "Address not found.", "NotFound");
      return serializeAddress(doc as IAddress & { _id: mongoose.Types.ObjectId });
    } catch (err) {
      if (isDuplicateKeyError(err)) continue;
      throw err;
    }
  }
  throw new ApiError(409, "Another default address was just set. Please try again.", "DefaultRace");
}
