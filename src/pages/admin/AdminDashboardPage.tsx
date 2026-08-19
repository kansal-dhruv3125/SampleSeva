import { useEffect, useState } from "react";
import { fetchAdminDashboard, type AdminDashboardStats } from "../../lib/api";

const STAT_CARDS = [
  { key: "totalCustomers", label: "Total Customers", color: "bg-blue-500" },
  { key: "totalLabs", label: "Total Labs", color: "bg-green-500" },
  { key: "totalBookings", label: "Total Bookings", color: "bg-purple-500" },
  { key: "pendingBookings", label: "Pending Bookings", color: "bg-yellow-500" },
  { key: "confirmedBookings", label: "Confirmed Bookings", color: "bg-indigo-500" },
  { key: "completedBookings", label: "Completed Bookings", color: "bg-emerald-500" },
] as const;

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAdminDashboard()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-white text-xl`}>
                {card.key === "totalCustomers" && "👥"}
                {card.key === "totalLabs" && "🏥"}
                {card.key === "totalBookings" && "📋"}
                {card.key === "pendingBookings" && "⏳"}
                {card.key === "confirmedBookings" && "✅"}
                {card.key === "completedBookings" && "🎉"}
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? stats[card.key] : 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats && stats.cancelledBookings > 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white text-xl">
              ❌
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelledBookings}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
