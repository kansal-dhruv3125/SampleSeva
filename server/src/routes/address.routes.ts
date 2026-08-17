import { Router } from "express";
import {
  createAddressController,
  deleteAddressController,
  listAddressesController,
  setDefaultAddressController,
  updateAddressController,
} from "../controllers/address.controller.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Address endpoints (Phase 5I): list / create / update / delete / set-default.
 * All require authentication — ownership is always the session user.
 */
export const addressRouter = Router();

addressRouter.use(requireAuth);
addressRouter.get("/", listAddressesController);
addressRouter.post("/", createAddressController);
addressRouter.patch("/:id", updateAddressController);
addressRouter.delete("/:id", deleteAddressController);
addressRouter.patch("/:id/default", setDefaultAddressController);
