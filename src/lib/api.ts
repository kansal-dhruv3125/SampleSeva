import type { AuthUser, Booking, Category, HealthPackage, Lab, LabTestOffering, SavedAddress, Test } from "../types";

/**
 * Phase 5F/5G — typed API client for the SampleSeva backend.
 *
 * The backend exposes the seeded catalogue (categories, tests, packages,
 * labs, lab-test offerings) and the auth API (signup/login/logout/me)
 * through the REST API. The DTOs it returns are shaped exactly like the
 * frontend types in src/types, so components consume them without redesign.
 *
 * Base URL: `VITE_API_URL` if set. When unset, production builds default to
 * the same origin (serve the frontend and API behind one domain/proxy) and
 * development defaults to http://localhost:4000 (the Phase 5B dev backend).
 * Auth sessions use an httpOnly cookie, so every request sends credentials
 * (cookies) automatically.
 */

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ??
  (import.meta.env.PROD ? "" : "http://localhost:4000");

/** Error thrown for failed API requests (network or non-2xx response). */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiList<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });
  } catch {
    throw new ApiError("Cannot reach the SampleSeva API. Please check that the backend is running.", 0);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // Keep the default message when the body isn't JSON.
    }
    throw new ApiError(message, res.status);
  }

  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}

async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  payload?: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  } catch {
    throw new ApiError("Cannot reach the SampleSeva API. Please check that the backend is running.", 0);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // Keep the default message when the body isn't JSON.
    }
    throw new ApiError(message, res.status);
  }

  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}

function toQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as Array<[string, unknown]>) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// --- API response shapes (frontend types + embedded context) ----------------

export interface LabSummary {
  slug: string;
  name: string;
  city: string;
  area: string;
  rating: number;
  reviewCount: number;
}

export interface TestSummary {
  id: string;
  slug: string;
  name: string;
  sampleType: string;
}

/** Offering as returned by the test-detail endpoint (lab embedded). */
export interface TestOffering extends LabTestOffering {
  lab: LabSummary;
}

/** Offering as returned by the lab-detail endpoint (test embedded). */
export interface LabOffering extends LabTestOffering {
  test: TestSummary;
}

export interface TestListParams {
  q?: string;
  category?: string;
  sampleType?: string;
  homeCollection?: boolean;
  fastingRequired?: boolean;
  popular?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface LabListParams {
  city?: string;
  q?: string;
  homeCollection?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

// --- Catalogue API functions -------------------------------------------------

export function fetchCategories(): Promise<Category[]> {
  return apiGet<ApiList<Category>>("/api/categories").then((r) => r.items);
}

export function fetchTests(params: TestListParams = {}): Promise<ApiList<Test>> {
  return apiGet<ApiList<Test>>(`/api/tests${toQuery(params)}`);
}

export function fetchTestBySlug(slug: string): Promise<Test> {
  return apiGet<Test>(`/api/tests/${encodeURIComponent(slug)}`);
}

export function fetchTestOfferings(slug: string): Promise<TestOffering[]> {
  return apiGet<ApiList<TestOffering>>(`/api/tests/${encodeURIComponent(slug)}/offerings`).then((r) => r.items);
}

export function fetchPackages(category?: string): Promise<HealthPackage[]> {
  return apiGet<ApiList<HealthPackage>>(`/api/packages${toQuery({ category })}`).then((r) => r.items);
}

export function fetchPackageBySlug(slug: string): Promise<HealthPackage> {
  return apiGet<HealthPackage>(`/api/packages/${encodeURIComponent(slug)}`);
}

export function fetchLabs(params: LabListParams = {}): Promise<ApiList<Lab>> {
  return apiGet<ApiList<Lab>>(`/api/labs${toQuery(params)}`);
}

export function fetchLabBySlug(slug: string): Promise<Lab> {
  return apiGet<Lab>(`/api/labs/${encodeURIComponent(slug)}`);
}

export function fetchLabOfferings(labId: string): Promise<LabOffering[]> {
  return apiGet<ApiList<LabOffering>>(`/api/lab-offerings${toQuery({ labId })}`).then((r) => r.items);
}

// --- Auth API functions (Phase 5G) -------------------------------------------

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

/**
 * GET /api/auth/me — resolves the current session, or null when logged out
 * (401 is expected on the first load and is not an error).
 */
export async function fetchAuthUser(): Promise<AuthUser | null> {
  try {
    return await apiGet<{ user: AuthUser }>("/api/auth/me").then((r) => r.user);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

/** POST /api/auth/signup — creates the account and signs in (sets the cookie). */
export function signupUser(input: SignupInput): Promise<AuthUser> {
  return apiSend<{ user: AuthUser }>("/api/auth/signup", "POST", input).then((r) => r.user);
}

/** POST /api/auth/login — authenticates and sets the session cookie. */
export function loginUser(input: LoginInput): Promise<AuthUser> {
  return apiSend<{ user: AuthUser }>("/api/auth/login", "POST", input).then((r) => r.user);
}

/** POST /api/auth/logout — clears the session cookie. */
export function logoutUser(): Promise<void> {
  return apiSend<{ loggedOut: boolean }>("/api/auth/logout", "POST").then(() => undefined);
}

// --- Booking API functions (Phase 5H) ----------------------------------------

/**
 * Booking-creation payload sent to the API. Prices are intentionally NOT
 * sent — the server computes them from the lab-test offering.
 */
export interface CreateBookingInput {
  testId: string;
  labId: string;
  labTestOfferingId: string;
  collectionMethod: "home_collection" | "lab_visit";
  appointmentDate: string;
  appointmentTime: string;
  patient: {
    name: string;
    dob?: string;
    gender?: string;
    phone: string;
    email?: string;
  };
  address?: {
    line1: string;
    line2?: string;
    locality?: string;
    city: string;
    state: string;
    pincode: string;
  };
  notes?: string;
}

/** POST /api/bookings — create a booking for the authenticated user. */
export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return apiSend<{ booking: Booking }>("/api/bookings", "POST", input).then((r) => r.booking);
}

/** GET /api/bookings — the authenticated user's bookings, newest first. */
export function fetchBookings(): Promise<Booking[]> {
  return apiGet<ApiList<Booking>>("/api/bookings").then((r) => r.items);
}

/** GET /api/bookings/:id — one booking owned by the authenticated user. */
export function fetchBookingById(id: string): Promise<Booking> {
  return apiGet<{ booking: Booking }>(`/api/bookings/${encodeURIComponent(id)}`).then((r) => r.booking);
}

/** PATCH /api/bookings/:id/cancel — cancel a booking owned by the user. */
export function cancelBooking(id: string): Promise<Booking> {
  return apiSend<{ booking: Booking }>(`/api/bookings/${encodeURIComponent(id)}/cancel`, "PATCH").then(
    (r) => r.booking,
  );
}

// --- Address API functions (Phase 5I) -----------------------------------------

export interface AddressInput {
  label?: string;
  line1: string;
  line2?: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

/** GET /api/addresses — the authenticated user's saved addresses. */
export function fetchAddresses(): Promise<SavedAddress[]> {
  return apiGet<ApiList<SavedAddress>>("/api/addresses").then((r) => r.items);
}

/** POST /api/addresses — create a saved address. */
export function createAddress(input: AddressInput): Promise<SavedAddress> {
  return apiSend<{ address: SavedAddress }>("/api/addresses", "POST", input).then((r) => r.address);
}

/** PATCH /api/addresses/:id — update a saved address (partial). */
export function updateAddress(id: string, input: Partial<AddressInput>): Promise<SavedAddress> {
  return apiSend<{ address: SavedAddress }>(`/api/addresses/${encodeURIComponent(id)}`, "PATCH", input).then(
    (r) => r.address,
  );
}

/** DELETE /api/addresses/:id — delete a saved address. */
export function deleteAddress(id: string): Promise<void> {
  return apiSend<{ deleted: boolean }>(`/api/addresses/${encodeURIComponent(id)}`, "DELETE").then(() => undefined);
}

/** PATCH /api/addresses/:id/default — make an address the user's default. */
export function setDefaultAddress(id: string): Promise<SavedAddress> {
  return apiSend<{ address: SavedAddress }>(`/api/addresses/${encodeURIComponent(id)}/default`, "PATCH").then(
    (r) => r.address,
  );
}

// --- Admin API functions (Phase 1) --------------------------------------------

export interface AdminDashboardStats {
  totalCustomers: number;
  totalLabs: number;
  totalTests: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface AdminLab {
  id: string;
  name: string;
  slug: string;
  city: string;
  area: string;
  status: string;
  rating: number;
  reviewCount: number;
  homeCollection: boolean;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  reference: string;
  status: string;
  testName: string;
  labName: string;
  customerName: string;
  customerEmail: string;
  patientName: string;
  patientPhone: string;
  preferredDate: string;
  preferredTime: string;
  collectionMethod: string;
  amount: number;
  createdAt: string;
}

/** GET /api/admin/dashboard — admin summary stats. */
export function fetchAdminDashboard(): Promise<AdminDashboardStats> {
  return apiGet<AdminDashboardStats>("/api/admin/dashboard");
}

/** GET /api/admin/users — paginated user list. */
export function fetchAdminUsers(params: { page?: number; limit?: number; search?: string } = {}): Promise<ApiList<AdminUser>> {
  return apiGet<ApiList<AdminUser>>(`/api/admin/users${toQuery(params)}`);
}

/** GET /api/admin/labs — paginated lab list. */
export function fetchAdminLabs(params: { page?: number; limit?: number; search?: string } = {}): Promise<ApiList<AdminLab>> {
  return apiGet<ApiList<AdminLab>>(`/api/admin/labs${toQuery(params)}`);
}

/** GET /api/admin/bookings — paginated booking list. */
export function fetchAdminBookings(params: { page?: number; limit?: number; status?: string } = {}): Promise<ApiList<AdminBooking>> {
  return apiGet<ApiList<AdminBooking>>(`/api/admin/bookings${toQuery(params)}`);
}
