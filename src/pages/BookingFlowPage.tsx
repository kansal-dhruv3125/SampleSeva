import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Home, MapPin } from "lucide-react";
import { formatINR } from "../data";
import { Button } from "../components/ui/Button";
import { ErrorState, LoadingState } from "../components/ui/AsyncState";
import { FieldError, Input, Label, Select, Textarea } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { createBooking, fetchAddresses, fetchTestBySlug, fetchTestOfferings } from "../lib/api";
import type { Booking, BookingFormValues, BookingGender, SavedAddress } from "../types";

const TIME_SLOTS = [
  "9:00 AM - 12:00 PM",
  "12:00 PM - 4:00 PM",
  "4:00 PM - 8:00 PM",
  "Weekday morning",
];

const stepLabels = ["Collection", "Date & time", "Patient", "Address", "Review"];

const defaultAddress = {
  line1: "",
  line2: "",
  locality: "",
  city: "",
  state: "Karnataka",
  pincode: "",
};

export function BookingFlowPage() {
  const { testSlug, labSlug } = useParams<{ testSlug?: string; labSlug?: string }>();
  const [searchParams] = useSearchParams();

  // The test, its offerings and the lab all come from the real catalogue API —
  // the booking references the database ObjectIds, not demo data ids.
  const { data: testData, loading: testLoading, error: testError, refetch } = useApi(
    () => (testSlug ? fetchTestBySlug(testSlug) : Promise.resolve(null)),
    [testSlug],
  );
  const { data: offeringsData } = useApi(
    () => (testSlug ? fetchTestOfferings(testSlug) : Promise.resolve([])),
    [testSlug],
  );
  // The authenticated user's saved addresses, offered as one-tap choices for
  // home collection. Failures are silent — the free-form address form still
  // works and the booking snapshots whatever address is entered.
  const { data: savedAddressesData } = useApi(fetchAddresses, []);
  const savedAddresses = savedAddressesData ?? [];

  const test = testData ?? undefined;
  const offerings = offeringsData ?? [];

  const offering = useMemo(() => {
    if (!test) return undefined;
    if (labSlug) {
      return offerings.find((item) => item.lab.slug === labSlug) ?? offerings[0];
    }
    return offerings[0];
  }, [labSlug, offerings, test]);

  const selectedLab = useMemo(() => {
    if (!offering) return undefined;
    return {
      id: offering.labId,
      slug: offering.lab.slug,
      name: offering.lab.name,
      city: offering.lab.city,
      area: offering.lab.area,
    };
  }, [offering]);

  const itemName = test?.name ?? searchParams.get("item") ?? "Diagnostic test";
  const amount = offering?.price ?? test?.priceFrom ?? 0;
  const collectionFee = offering?.collectionFee ?? 0;
  const expectedReportTime = offering?.reportTime ? String(offering.reportTime) : "Varies by lab";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BookingFormValues>({
    testId: test?.id ?? "",
    testName: itemName,
    labId: selectedLab?.id ?? "",
    labName: selectedLab?.name ?? "",
    testSlug: test?.slug,
    labSlug: selectedLab?.slug ?? labSlug,
    patientName: "",
    dob: "",
    gender: "prefer-not-to-say",
    phone: "",
    email: "",
    collectionMode: offering?.homeCollectionAvailability === "available" || offering?.homeCollectionAvailability === "lab-dependent" ? "home" : "lab",
    preferredDate: "",
    preferredTime: TIME_SLOTS[0],
    address: {
      ...defaultAddress,
      city: selectedLab?.city ?? "",
      state: selectedLab ? "Karnataka" : "",
    },
    notes: "",
    amount,
    collectionFee,
    expectedReportTime,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!test || !selectedLab) return;
    setForm((current) => ({
      ...current,
      testId: test.id,
      testName: test.name,
      testSlug: test.slug,
      labId: selectedLab.id,
      labName: selectedLab.name,
      labSlug: selectedLab.slug,
      amount: offering?.price ?? current.amount,
      collectionFee: offering?.collectionFee ?? current.collectionFee,
      expectedReportTime: expectedReportTime,
      address: {
        ...current.address,
        city: current.address.city || selectedLab.city,
      },
    }));
  }, [expectedReportTime, offering, selectedLab, test]);

  usePageTitle(confirmedBooking ? `Booking confirmed` : `Book ${itemName}`);

  if (testLoading) {
    return <LoadingState label="Loading test details…" />;
  }

  if (testError) {
    return (
      <div className="container-x py-16">
        <ErrorState message={testError} onRetry={refetch} />
        <div className="mt-6 text-center">
          <Button to="/tests" variant="outline">Back to tests</Button>
        </div>
      </div>
    );
  }

  if (!test && !searchParams.get("item")) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">No test selected</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a test from the catalogue to continue with your booking.</p>
        <Button to="/tests" className="mt-6">Browse tests</Button>
      </div>
    );
  }

  const validateField = (currentStep: number, currentForm: BookingFormValues) => {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!currentForm.collectionMode) nextErrors.collectionMode = "Please choose how you would like to collect your sample.";
    }

    if (currentStep === 2) {
      if (!currentForm.preferredDate) nextErrors.preferredDate = "Please select a preferred date.";
      if (!currentForm.preferredTime) nextErrors.preferredTime = "Please choose a time slot.";
    }

    if (currentStep === 3) {
      if (!currentForm.patientName.trim()) nextErrors.patientName = "Please enter the patient's full name.";
      if (!currentForm.phone.trim() || !/^\d{10}$/.test(currentForm.phone.replace(/\s+/g, ""))) {
        nextErrors.phone = "Use a valid 10-digit mobile number.";
      }
      if (currentForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email)) {
        nextErrors.email = "Please enter a valid email address.";
      }
    }

    if (currentStep === 4) {
      if (currentForm.collectionMode === "home") {
        if (!currentForm.address?.line1.trim()) nextErrors.line1 = "Address line 1 is required for home collection.";
        if (!currentForm.address?.city.trim()) nextErrors.city = "City is required.";
        if (!currentForm.address?.pincode || !/^\d{6}$/.test(currentForm.address.pincode)) {
          nextErrors.pincode = "Enter a valid 6-digit pincode.";
        }
      }
    }

    return nextErrors;
  };

  const updateField = <K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateAddress = (key: keyof BookingFormValues["address"], value: string) => {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [key]: value,
      },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const useSavedAddress = (address: SavedAddress) => {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        line1: address.line1,
        line2: address.line2 ?? "",
        locality: address.locality ?? "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    }));
    setErrors((current) => ({ ...current, line1: "", city: "", pincode: "" }));
  };

  const handleNext = () => {
    const nextErrors = validateField(step, form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
  };

  const handleSubmit = async () => {
    const nextErrors = validateField(step, form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (!test || !offering) {
      setErrors({ form: "The test or lab could not be loaded. Please go back and try again." });
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createBooking({
        // Real database ObjectIds — the API rejects slug ids.
        testId: offering.testObjectId ?? "",
        labId: offering.labObjectId ?? "",
        labTestOfferingId: offering.id,
        collectionMethod: form.collectionMode === "home" ? "home_collection" : "lab_visit",
        appointmentDate: form.preferredDate,
        appointmentTime: form.preferredTime,
        patient: {
          name: form.patientName,
          dob: form.dob || undefined,
          gender: form.gender,
          phone: form.phone,
          email: form.email || undefined,
        },
        address:
          form.collectionMode === "home"
            ? {
                line1: form.address.line1,
                line2: form.address.line2 || undefined,
                locality: form.address.locality || undefined,
                city: form.address.city,
                state: form.address.state,
                pincode: form.address.pincode,
              }
            : undefined,
        notes: form.notes || undefined,
      });
      setConfirmedBooking(booking);
      setStep(5);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not create your booking. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = step < 5;
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (confirmedBooking) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-card">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Confirmed</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Booking confirmed</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Your booking for <span className="font-semibold text-slate-900">{confirmedBooking.testName}</span> at{" "}
            <span className="font-semibold text-slate-900">{confirmedBooking.labName}</span> was created successfully.
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-4 text-left">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Reference</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{confirmedBooking.reference}</p>
            <p className="mt-2 text-sm text-slate-600">{confirmedBooking.labName}</p>
            <p className="mt-1 text-sm text-slate-600">{confirmedBooking.preferredDate} · {confirmedBooking.preferredTime}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button to="/bookings">View bookings</Button>
            <Button to={test ? `/tests/${test.slug}` : "/tests"} variant="outline">Back to test</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to={test ? `/tests/${test.slug}` : "/tests"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-700">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>
        <span className="text-sm text-slate-500">Step {step} of {stepLabels.length}</span>
      </div>

      <div className="mb-8 flex items-center gap-2 overflow-x-auto">
        {stepLabels.map((label, index) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${index + 1 === step ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500"}`}
          >
            <span>{index + 1}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card p-6 sm:p-7">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">New booking</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{itemName}</h1>
            {selectedLab && <p className="mt-1 text-sm text-slate-600">{selectedLab.name} · {selectedLab.city}</p>}
          </div>

          {errors.form && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {errors.form}
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 space-y-4">
              <p className="text-sm font-semibold text-slate-800">How would you like your sample collected?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "home", label: "Home collection", icon: Home },
                  { value: "lab", label: "Visit the lab", icon: MapPin },
                ].map((option) => {
                  const Icon = option.icon;
                  const active = form.collectionMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("collectionMode", option.value as "home" | "lab")}
                      className={`rounded-2xl border p-4 text-left transition-colors ${active ? "border-primary-600 bg-primary-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`grid size-10 place-items-center rounded-xl ${active ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className={`font-semibold ${active ? "text-primary-800" : "text-slate-900"}`}>{option.label}</p>
                          <p className="text-xs text-slate-500">{option.value === "home" ? "Sample collector arrives at your address" : "Visit the lab at a convenient time"}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.collectionMode && <FieldError>{errors.collectionMode}</FieldError>}
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="preferred-date">Preferred date</Label>
                <Input
                  id="preferred-date"
                  type="date"
                  min={minDate}
                  value={form.preferredDate}
                  onChange={(e) => updateField("preferredDate", e.target.value)}
                  aria-invalid={!!errors.preferredDate}
                />
                <FieldError>{errors.preferredDate}</FieldError>
              </div>
              <div>
                <Label htmlFor="preferred-time">Preferred time slot</Label>
                <Select
                  id="preferred-time"
                  value={form.preferredTime}
                  onChange={(e) => updateField("preferredTime", e.target.value)}
                  aria-invalid={!!errors.preferredTime}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </Select>
                <FieldError>{errors.preferredTime}</FieldError>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="patient-name">Patient full name</Label>
                <Input id="patient-name" value={form.patientName} onChange={(e) => updateField("patientName", e.target.value)} aria-invalid={!!errors.patientName} />
                <FieldError>{errors.patientName}</FieldError>
              </div>
              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={form.dob} onChange={(e) => updateField("dob", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select id="gender" value={form.gender} onChange={(e) => updateField("gender", e.target.value as BookingGender)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Mobile number</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} aria-invalid={!!errors.phone} />
                <FieldError>{errors.phone}</FieldError>
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} aria-invalid={!!errors.email} />
                <FieldError>{errors.email}</FieldError>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-6 space-y-4">
              {form.collectionMode === "home" ? (
                <>
                  {savedAddresses.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Use a saved address</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => useSavedAddress(address)}
                            className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm transition-colors hover:border-primary-500"
                          >
                            <span className="flex items-center gap-1.5 font-medium text-slate-900">
                              {address.label ?? address.line1}
                              {address.isDefault && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Default
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {address.city}, {address.state} - {address.pincode}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-slate-500">…or enter a new address below</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="line1">Address line 1</Label>
                    <Input id="line1" value={form.address.line1} onChange={(e) => updateAddress("line1", e.target.value)} aria-invalid={!!errors.line1} />
                    <FieldError>{errors.line1}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="line2">Address line 2 (optional)</Label>
                    <Input id="line2" value={form.address.line2} onChange={(e) => updateAddress("line2", e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="locality">Locality</Label>
                      <Input id="locality" value={form.address.locality} onChange={(e) => updateAddress("locality", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.address.city} onChange={(e) => updateAddress("city", e.target.value)} aria-invalid={!!errors.city} />
                      <FieldError>{errors.city}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={form.address.state} onChange={(e) => updateAddress("state", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" value={form.address.pincode} onChange={(e) => updateAddress("pincode", e.target.value)} aria-invalid={!!errors.pincode} />
                      <FieldError>{errors.pincode}</FieldError>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Lab visit booking</p>
                  <p className="mt-2">We will confirm the visit location and address when the appointment is scheduled.</p>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Review details</p>
                <dl className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-4"><dt>Service</dt><dd className="font-medium text-slate-900">{form.testName}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Lab</dt><dd className="font-medium text-slate-900">{form.labName || "TBD"}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Collection</dt><dd className="font-medium text-slate-900">{form.collectionMode === "home" ? "Home collection" : "Visit lab"}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Date</dt><dd className="font-medium text-slate-900">{form.preferredDate}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Time</dt><dd className="font-medium text-slate-900">{form.preferredTime}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Patient</dt><dd className="font-medium text-slate-900">{form.patientName}</dd></div>
                </dl>
              </div>
              <div>
                <Label htmlFor="notes">Notes for the lab (optional)</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Any extra instructions or preferred timing notes" />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 1))}>
                Previous
              </Button>
            )}
            {canProceed ? (
              <Button type="button" className="sm:ml-auto" onClick={handleNext}>Next</Button>
            ) : (
              <Button type="button" className="sm:ml-auto" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Confirming…" : "Confirm booking"}
              </Button>
            )}
          </div>
        </section>

        <aside className="card h-fit p-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Booking summary</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{itemName}</h2>
          {selectedLab && <p className="mt-1 text-sm text-slate-600">{selectedLab.name}</p>}

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <span>Price</span>
              <span className="font-semibold text-slate-900">{formatINR(amount)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Collection fee</span>
              <span className="font-semibold text-slate-900">{formatINR(collectionFee)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatINR(amount + collectionFee)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <Clock3 className="size-4 text-primary-600" aria-hidden="true" />
              Expected report time
            </div>
            <p className="mt-2">{expectedReportTime}</p>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            Your booking is saved to your SampleSeva account and you can manage it from My Bookings.
          </p>
        </aside>
      </div>
    </div>
  );
}
