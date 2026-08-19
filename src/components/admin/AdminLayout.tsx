import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

/**
 * Admin panel layout — sidebar + main content area.
 * The admin route tree wraps protected pages in <RequireRole> before this.
 */
export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
