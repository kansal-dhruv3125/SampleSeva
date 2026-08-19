import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/bookings", label: "Bookings", icon: "📋" },
  { to: "/admin/patients", label: "Patients", icon: "👥" },
  { to: "/admin/labs", label: "Labs", icon: "🏥" },
  { to: "/admin/tests", label: "Tests", icon: "🧪" },
  { to: "/admin/packages", label: "Health Packages", icon: "📦" },
  { to: "/admin/reports", label: "Reports", icon: "📄" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-blue-400">SampleSeva Admin</h2>
        <p className="text-xs text-gray-400 mt-1">{user?.name}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <button
          onClick={() => void logout()}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
