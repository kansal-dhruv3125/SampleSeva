import type { IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth middleware — the authenticated user's id. */
      userId?: string;
      userRole?: IUser["role"];
    }
  }
}

export {};
