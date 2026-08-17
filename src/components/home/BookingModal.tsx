import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { FieldError, Input, Label, Select } from "../ui/Field";

export const TIME_SLOTS = ["6:00 – 9:00 AM", "9:00 AM – 12:00 PM", "12:00 – 4:00 PM", "4:00 – 8:00 PM"];

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  itemLabel: string;
  price?: string;
}

/**
 * Phase 1 booking-intent modal. Collects a demo booking request and clearly
 * confirms that live booking launches in Phase 2 — nothing is persisted and
 * no real appointment is created.
 */
export function BookingModal({ open, onClose, itemLabel, price }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [collection, setCollection] = useState<"home" | "visit">("home");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; date?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setName("");
    setPhone("");
    setDate("");
    setTimeSlot(TIME_SLOTS[1]);
    setCollection("home");
    setErrors({});
    setSubmitted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Please enter your name";
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ""))) nextErrors.phone = "Enter a valid 10-digit mobile number";
    if (!date) nextErrors.date = "Please pick a preferred date";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Modal open={open} onClose={handleClose} title={`Book ${itemLabel}`}>
      {submitted ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-emerald-50">
            <CircleCheck className="size-8 text-emerald-600" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Request noted!</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
            Thanks, {name.trim().split(" ")[0]}! This is a Phase 1 demo, so no real booking was
            created. Live scheduling for <strong>{itemLabel}</strong> launches in Phase 2 — we'll
            let you know as soon as it's ready.
          </p>
          <Button className="mt-6" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5 flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{itemLabel}</p>
              {price && <p className="text-xs text-slate-600">from {price}</p>}
            </div>
            <span className="text-xs font-medium text-primary-700">Home collection available</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bk-name">Full name</Label>
              <Input
                id="bk-name"
                autoComplete="name"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              <FieldError>{errors.name}</FieldError>
            </div>
            <div>
              <Label htmlFor="bk-phone">Mobile number</Label>
              <Input
                id="bk-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
              />
              <FieldError>{errors.phone}</FieldError>
            </div>
            <div>
              <Label htmlFor="bk-date">Preferred date</Label>
              <Input
                id="bk-date"
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={!!errors.date}
              />
              <FieldError>{errors.date}</FieldError>
            </div>
            <div>
              <Label htmlFor="bk-time">Time slot</Label>
              <Select id="bk-time" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-medium text-slate-700">Sample collection</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Sample collection">
              {(
                [
                  { value: "home", label: "Home collection" },
                  { value: "visit", label: "Visit lab" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={collection === opt.value}
                  onClick={() => setCollection(opt.value)}
                  className={
                    collection === opt.value
                      ? "rounded-xl border-2 border-primary-600 bg-primary-50 px-4 py-3 text-left"
                      : "rounded-xl border border-slate-300 bg-white px-4 py-3 text-left hover:border-slate-400"
                  }
                >
                  <span
                    className={
                      collection === opt.value ? "text-sm font-semibold text-primary-800" : "text-sm font-medium text-slate-700"
                    }
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
            <strong className="text-slate-600">Demo preview:</strong> submitting this form does not
            create a booking or store your details. Live booking, payments and confirmations arrive
            in Phase 2.
          </p>

          <div className="mt-6">
            <Button type="submit" fullWidth size="lg">
              Continue
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
