import { useState } from "react";
import { ChevronDown, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { FieldError, Input, Label, Textarea } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import { cn } from "../lib/utils";

const CONTACT_CARDS = [
  { icon: Mail, label: "Email", value: "hello@sampleseva.in" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210" },
  { icon: MapPin, label: "Based in", value: "Rajpura, Punjab (demo)" },
];

const FAQS = [
  {
    q: "Is SampleSeva live for bookings right now?",
    a: "Not yet. This is a Phase 1 preview of the product UI. Live scheduling, payments and lab integrations launch in Phase 2.",
  },
  {
    q: "Are the labs and prices on the site real?",
    a: "No. All labs, ratings, tests and prices are fictional demo data used to design and test the experience. We'll share real listings when partnerships go live.",
  },
  {
    q: "Will home sample collection be available in my city?",
    a: "The demo currently showcases Rajpura, Patiala, Chandigarh and Mohali. We'll announce the full city rollout along with Phase 2.",
  },
  {
    q: "How can my lab partner with SampleSeva?",
    a: "Reach out through the form below or via hello@sampleseva.in. Our lab onboarding program opens in Phase 2.",
  },
];

export function ContactPage() {
  usePageTitle("Contact Us");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address";
    if (!form.message.trim()) nextErrors.message = "Please write a short message";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSent(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Contact Us"
        subtitle="Questions about SampleSeva, the demo, or lab partnerships? We'd love to hear from you."
      />

      <div className="container-x section-pad grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            {CONTACT_CARDS.map((card) => (
              <div key={card.label} className="card p-5 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  <card.icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-xs font-medium text-slate-500">{card.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="card mt-6 p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-emerald-50">
                  <Send className="size-6 text-emerald-600" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Message received!</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                  Thanks, {form.name.trim().split(" ")[0]}! This is a Phase 1 demo, so no message
                  was sent — live support opens with Phase 2.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2 className="text-lg font-semibold text-slate-900">Send us a message</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ct-name">Name</Label>
                    <Input
                      id="ct-name"
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      aria-invalid={!!errors.name}
                    />
                    <FieldError>{errors.name}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="ct-email">Email</Label>
                    <Input
                      id="ct-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      aria-invalid={!!errors.email}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="ct-message">Message</Label>
                  <Textarea
                    id="ct-message"
                    placeholder="How can we help?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    aria-invalid={!!errors.message}
                  />
                  <FieldError>{errors.message}</FieldError>
                </div>
                <Button type="submit" className="mt-5">
                  Send message
                </Button>
                <p className="mt-3 text-xs text-slate-400">
                  Demo form — nothing is transmitted or stored in Phase 1.
                </p>
              </form>
            )}
          </div>
        </div>

        <div id="faq">
          <h2 className="text-lg font-semibold text-slate-900">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.q} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                      <MessageCircle className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn("size-4 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
