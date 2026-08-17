import { PageHeader } from "../components/ui/PageHeader";
import { usePageTitle } from "../hooks/usePageTitle";

const SECTIONS = [
  {
    title: "1. About this preview",
    body: "SampleSeva is a diagnostic laboratory test booking marketplace currently in Phase 1 development. Everything you see — tests, packages, labs, prices and ratings — is fictional demo content shown to preview the product experience. Nothing on this site constitutes a real offer, appointment, or medical service.",
  },
  {
    title: "2. No medical advice",
    body: "Content on SampleSeva is for informational purposes and does not constitute medical advice, diagnosis or treatment. Always consult a qualified healthcare professional for medical decisions.",
  },
  {
    title: "3. Demo data disclaimer",
    body: "Laboratory listings, ratings, prices and availability are illustrative only. Actual services, pricing, collection requirements and report timelines will be published once real lab partnerships begin in Phase 2.",
  },
  {
    title: "4. Future services",
    body: "When live booking, payments and reporting launch, these terms will be updated to govern those services, including cancellation, refund and liability policies.",
  },
  {
    title: "5. Contact",
    body: "Questions about these terms? Reach us at hello@sampleseva.in.",
  },
];

export function TermsPage() {
  usePageTitle("Terms & Conditions");

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="Last updated: August 2026 · Draft for Phase 1 preview"
      />
      <div className="container-x section-pad">
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Draft notice:</strong> these terms are placeholders for the Phase 1 UI preview
          and will be finalised before live services launch.
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
