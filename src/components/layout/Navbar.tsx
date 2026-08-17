import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Tests", to: "/tests" },
  { label: "Health Packages", to: "/packages" },
  { label: "Labs", to: "/labs" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-200",
        scrolled
          ? "border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white/80 backdrop-blur-md",
      )}
    >
      <nav
        aria-label="Main navigation"
        className="container-x flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]"
      >
        <Logo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <Button to="/account" variant="ghost" size="sm">
              My Account
            </Button>
          ) : (
            <Button to="/login" variant="ghost" size="sm">
              Log In
            </Button>
          )}
          <Button to="/bookings" variant="ghost" size="sm">
            My Bookings
          </Button>
          <Button to="/tests" size="sm">
            Book a Test
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button to="/tests" size="sm" className="px-3.5 sm:px-4">
            Book a Test
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100"
          >
            {mobileOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-card-hover lg:hidden animate-fade-in"
        >
          <div className="container-x flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              {user ? (
                <Button to="/account" variant="outline" fullWidth>
                  My Account
                </Button>
              ) : (
                <Button to="/login" variant="outline" fullWidth>
                  Log In
                </Button>
              )}
              <Button to="/bookings" variant="outline" fullWidth>
                My Bookings
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
