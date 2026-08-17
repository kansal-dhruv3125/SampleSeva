import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "../services/address.service.js";
import { validateAddress } from "../validators/address.validators.js";

/**
 * Address controllers (Phase 5I). Every handler requires authentication and
 * scopes all queries to the session user (req.userId).
 */

/** GET /api/addresses — the authenticated user's saved addresses. */
export async function listAddressesController(req: Request, res: Response): Promise<void> {
  const addresses = await listAddresses(req.userId ?? "");
  res.json({ success: true, data: { items: addresses, total: addresses.length } });
}

/** POST /api/addresses — create a saved address for the authenticated user. */
export async function createAddressController(req: Request, res: Response): Promise<void> {
  const validation = validateAddress(req.body ?? {});
  if (!validation.isValid) {
    const first = Object.values(validation.errors)[0];
    throw new ApiError(400, first ?? "Invalid address details.", "ValidationError");
  }

  const address = await createAddress(req.userId ?? "", {
    label: req.body.label,
    line1: req.body.line1,
    line2: req.body.line2,
    locality: req.body.locality,
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    landmark: req.body.landmark,
    isDefault: req.body.isDefault,
  });

  res.status(201).json({ success: true, data: { address } });
}

/** PATCH /api/addresses/:id — update an address owned by the user. */
export async function updateAddressController(req: Request, res: Response): Promise<void> {
  const validation = validateAddress(req.body ?? {}, { partial: true });
  if (!validation.isValid) {
    const first = Object.values(validation.errors)[0];
    throw new ApiError(400, first ?? "Invalid address details.", "ValidationError");
  }
  const id = typeof req.params.id === "string" ? req.params.id : "";

  const address = await updateAddress(req.userId ?? "", id, {
    label: req.body.label,
    line1: req.body.line1,
    line2: req.body.line2,
    locality: req.body.locality,
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    landmark: req.body.landmark,
    isDefault: req.body.isDefault,
  });

  res.json({ success: true, data: { address } });
}

/** DELETE /api/addresses/:id — delete an address owned by the user. */
export async function deleteAddressController(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  await deleteAddress(req.userId ?? "", id);
  res.json({ success: true, data: { deleted: true } });
}

/** PATCH /api/addresses/:id/default — make an address the user's default. */
export async function setDefaultAddressController(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  const address = await setDefaultAddress(req.userId ?? "", id);
  res.json({ success: true, data: { address } });
}
