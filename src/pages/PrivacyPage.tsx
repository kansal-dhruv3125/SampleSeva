import { PageHeader } from "../components/ui/PageHeader";
import { usePageTitle } from "../hooks/usePageTitle";

const SECTIONS = [
  {
    title: "Information we collect",
    body: "SampleSeva is currently a Phase 1 product preview. No customer data is collected, stored or transmitted. When accounts and bookings launch in Phase 2, this policy will describe exactly what information we collect, why, and how it's used.",
  },
  {
    title: "How we use information",
    body: "In future phases, information such as your name, contact details and booking preferences will be used solely to provide booking, scheduling and reporting services — never sold to third parties.",
  },
  {
    title: "Data security",
    body: "We will apply industry-standard safeguards to protect your personal information once live services begin. This preview stores nothing.",
  },
  {
    title: "Your rights",
    body: "You will have the right to access, correct or delete your personal information, and to withdraw consent at any time, in accordance with applicable Indian law.",
  },
];

export function PrivacyPage() {
  usePageTitle("Privacy Policy");

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Last updated: August 2026 · Draft for Phase 1 preview"
      />
      <div className="container-x section-pad">
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Draft notice:</strong> this is a placeholder policy for the Phase 1 UI preview.
          It will be finalised before live services launch.
        </div>
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-2 max-w-3xl leading-relaxed text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
