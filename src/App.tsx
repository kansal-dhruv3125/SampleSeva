import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireRole } from "./components/auth/RequireRole";
import { Layout } from "./components/layout/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { HomePage } from "./pages/HomePage";
import { TestsPage } from "./pages/TestsPage";
import { TestDetailsPage } from "./pages/TestDetailsPage";
import { PackagesPage } from "./pages/PackagesPage";
import { PackageDetailsPage } from "./pages/PackageDetailsPage";
import { LabsPage } from "./pages/LabsPage";
import { LabDetailsPage } from "./pages/LabDetailsPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AccountPage } from "./pages/AccountPage";
import { AddressesPage } from "./pages/AddressesPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { BookingsPage } from "./pages/BookingsPage";
import { BookingDetailsPage } from "./pages/BookingDetailsPage";
import { BookingFlowPage } from "./pages/BookingFlowPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin panel — separate layout, no customer nav/footer */}
          <Route path="admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLoginPage />} />
            <Route
              path="dashboard"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <AdminDashboardPage />
                </RequireRole>
              }
            />
          </Route>

          {/* Customer-facing site */}
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="tests" element={<TestsPage />} />
            <Route path="tests/:slug" element={<TestDetailsPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="packages/:slug" element={<PackageDetailsPage />} />
            <Route path="labs" element={<LabsPage />} />
            <Route path="labs/:slug" element={<LabDetailsPage />} />
            <Route
              path="book/:testSlug/:labSlug?"
              element={
                <RequireAuth>
                  <BookingFlowPage />
                </RequireAuth>
              }
            />
            <Route
              path="bookings"
              element={
                <RequireAuth>
                  <BookingsPage />
                </RequireAuth>
              }
            />
            <Route
              path="bookings/:id"
              element={
                <RequireAuth>
                  <BookingDetailsPage />
                </RequireAuth>
              }
            />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route
              path="account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
            <Route
              path="account/addresses"
              element={
                <RequireAuth>
                  <AddressesPage />
                </RequireAuth>
              }
            />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
