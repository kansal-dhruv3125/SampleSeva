import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { Lab } from "../models/Lab.js";
import { Test } from "../models/Test.js";
import { Package } from "../models/Package.js";

/**
 * Admin service — reads real data from existing MongoDB models.
 * No mock data. All statistics are computed from live collections.
 */

/** Dashboard summary statistics for the admin panel. */
export async function getDashboardStats(): Promise<{
  totalCustomers: number;
  totalLabs: number;
  totalTests: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}> {
  const [
    totalCustomers,
    totalLabs,
    totalTests,
    bookingStats,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Lab.countDocuments({ status: "active" }),
    Test.countDocuments({ isActive: true }),
    Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const statusMap = new Map<string, number>();
  for (const row of bookingStats) {
    statusMap.set(row._id, row.count);
  }

  return {
    totalCustomers,
    totalLabs,
    totalTests,
    totalBookings: bookingStats.reduce((sum, r) => sum + r.count, 0),
    pendingBookings: statusMap.get("pending") ?? 0,
    confirmedBookings: statusMap.get("confirmed") ?? 0,
    completedBookings: statusMap.get("completed") ?? 0,
    cancelledBookings: statusMap.get("cancelled") ?? 0,
  };
}

/** List all customer users with pagination. */
export async function listUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ items: Array<Record<string, unknown>>; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));

  const filter: Record<string, unknown> = {};
  if (params.search?.trim()) {
    const q = params.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    items: docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      email: d.email,
      phone: d.phone ?? null,
      role: d.role,
      createdAt: d.createdAt.toISOString(),
    })),
    total,
  };
}

/** List all labs with pagination. */
export async function listLabs(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ items: Array<Record<string, unknown>>; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));

  const filter: Record<string, unknown> = {};
  if (params.search?.trim()) {
    const q = params.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    Lab.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lab.countDocuments(filter),
  ]);

  return {
    items: docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      slug: d.slug,
      city: d.city,
      area: d.area ?? "",
      status: d.status,
      rating: d.rating,
      reviewCount: d.reviewCount,
      homeCollection: d.homeCollection,
      createdAt: d.createdAt.toISOString(),
    })),
    total,
  };
}

/** List all bookings with pagination and optional status filter. */
export async function listBookings(params: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ items: Array<Record<string, unknown>>; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));

  const filter: Record<string, unknown> = {};
  if (params.status && ["pending", "confirmed", "completed", "cancelled"].includes(params.status)) {
    filter.status = params.status;
  }

  const POPULATE = [
    { path: "testId", select: "name slug" },
    { path: "labId", select: "name slug" },
    { path: "userId", select: "name email" },
  ];

  const [docs, total] = await Promise.all([
    Booking.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);

  return {
    items: docs.map((d) => {
      const test = d.testId as unknown as { _id: mongoose.Types.ObjectId; name: string; slug: string } | null;
      const lab = d.labId as unknown as { _id: mongoose.Types.ObjectId; name: string; slug: string } | null;
      const user = d.userId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string } | null;
      return {
        id: d._id.toString(),
        reference: d.bookingReference,
        status: d.status,
        testName: test?.name ?? "Unknown",
        labName: lab?.name ?? "Unknown",
        customerName: user?.name ?? "Unknown",
        customerEmail: user?.email ?? "Unknown",
        patientName: d.patient?.name ?? "Unknown",
        patientPhone: d.patient?.phone ?? "",
        preferredDate: d.appointmentDate,
        preferredTime: d.appointmentTime,
        collectionMethod: d.collectionMethod,
        amount: d.priceBreakdown?.total ?? 0,
        createdAt: d.createdAt.toISOString(),
      };
    }),
    total,
  };
}
