import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";

const LINK_GROUPS: Array<{
  heading: string;
  links: Array<{ label: string; to: string }>;
}> = [
  {
    heading: "SampleSeva",
    links: [
      { label: "About", to: "/about" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "For Patients",
    links: [
      { label: "Browse Tests", to: "/tests" },
      { label: "Health Packages", to: "/packages" },
      { label: "Labs", to: "/labs" },
      { label: "My Bookings", to: "/bookings" },
    ],
  },
  {
    heading: "For Labs",
    links: [
      { label: "Partner With Us", to: "/about#for-labs" },
      { label: "Lab Login", to: "/login" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "/contact#faq" },
      { label: "Contact Us", to: "/contact" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
];

const DISCLAIMER =
  "SampleSeva is a technology platform for discovering and booking diagnostic laboratory services. Test availability, pricing, collection requirements and report timelines may vary by laboratory.";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-x py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Healthcare testing, from the comfort of home. Compare labs and prices, and book
              home sample collection for tests and health packages.
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400">
              Made in India 🇮🇳
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <nav key={group.heading} aria-label={`${group.heading} links`}>
              <h3 className="text-sm font-semibold text-slate-900">{group.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-600 transition-colors hover:text-primary-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500">{DISCLAIMER}</p>
          <div className="mt-6 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 SampleSeva. All rights reserved.</p>
            <p className="text-slate-400">Demo marketplace — laboratory names, prices, availability and timings shown here are simulated for development.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
