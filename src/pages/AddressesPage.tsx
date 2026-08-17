import { useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorState, LoadingState } from "../components/ui/AsyncState";
import { FieldError, Input, Label } from "../components/ui/Field";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useApi } from "../hooks/useApi";
import { createAddress, deleteAddress, fetchAddresses, setDefaultAddress, updateAddress } from "../lib/api";
import type { SavedAddress } from "../types";

const emptyAddress = {
  line1: "",
  line2: "",
  locality: "",
  city: "",
  state: "Karnataka",
  pincode: "",
};

export function AddressesPage() {
  usePageTitle("Saved Addresses");
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi<SavedAddress[]>(fetchAddresses, []);
  const [label, setLabel] = useState("");
  const [form, setForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const addresses = useMemo(() => data ?? [], [data]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const updateField = <K extends keyof typeof emptyAddress>(key: K, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const startEdit = (address: SavedAddress) => {
    setEditingId(address.id);
    setLabel(address.label ?? "");
    setForm({
      line1: address.line1,
      line2: address.line2 ?? "",
      locality: address.locality ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setErrors({});
    setActionError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setForm(emptyAddress);
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.line1.trim()) nextErrors.line1 = "Address line 1 is required.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!/^\d{6}$/.test(form.pincode)) nextErrors.pincode = "Enter a valid 6-digit pincode.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setActionError(null);
    try {
      const payload = {
        label: label.trim() || undefined,
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        locality: form.locality.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };
      if (editingId) {
        await updateAddress(editingId, payload);
      } else {
        await createAddress(payload);
      }
      resetForm();
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not save this address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    setActionError(null);
    try {
      await deleteAddress(addressId);
      if (editingId === addressId) resetForm();
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not remove this address. Please try again.");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setActionError(null);
    try {
      await setDefaultAddress(addressId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not set this address as default. Please try again.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="My account"
        title="Saved addresses"
        subtitle="Keep home-collection addresses handy so booking takes only a few taps."
      />
      <div className="container-x py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Saved addresses ({addresses.length})
              </h2>
              <Button to="/account" variant="ghost" size="sm">
                Back to account
              </Button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {actionError}
              </div>
            )}

            {loading ? (
              <LoadingState label="Loading your addresses…" />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <MapPin className="mx-auto size-8 text-slate-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-slate-700">No saved addresses yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add an address on the right to prefill home collection bookings.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {addresses.map((address) => (
                  <li key={address.id} className="card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-sm text-slate-700">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          {address.label && (
                            <span className="inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                              {address.label}
                            </span>
                          )}
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="size-3" aria-hidden="true" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-slate-900">{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        {address.locality && <p>{address.locality}</p>}
                        <p>
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(address.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                            Set default
                          </button>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(address)}
                            aria-label={`Edit address ${address.label ?? address.line1}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(address.id)}
                            aria-label={`Delete address ${address.label ?? address.line1}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="card h-fit p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Edit address" : "Add a new address"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                <X className="size-3.5" aria-hidden="true" />
                Cancel editing
              </button>
            )}
            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
              <div>
                <Label htmlFor="addr-label">Label (optional)</Label>
                <Input
                  id="addr-label"
                  placeholder="Home, Work…"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="addr-line1">Address line 1</Label>
                <Input
                  id="addr-line1"
                  value={form.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  aria-invalid={!!errors.line1}
                />
                <FieldError>{errors.line1}</FieldError>
              </div>
              <div>
                <Label htmlFor="addr-line2">Address line 2 (optional)</Label>
                <Input
                  id="addr-line2"
                  value={form.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="addr-locality">Locality (optional)</Label>
                <Input
                  id="addr-locality"
                  value={form.locality}
                  onChange={(e) => updateField("locality", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="addr-city">City</Label>
                  <Input
                    id="addr-city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    aria-invalid={!!errors.city}
                  />
                  <FieldError>{errors.city}</FieldError>
                </div>
                <div>
                  <Label htmlFor="addr-state">State</Label>
                  <Input
                    id="addr-state"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="addr-pincode">Pincode</Label>
                <Input
                  id="addr-pincode"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  aria-invalid={!!errors.pincode}
                />
                <FieldError>{errors.pincode}</FieldError>
              </div>
              <Button type="submit" fullWidth disabled={submitting}>
                {editingId ? (
                  <>
                    <Pencil className="size-4" aria-hidden="true" />
                    {submitting ? "Saving…" : "Save changes"}
                  </>
                ) : (
                  <>
                    <Plus className="size-4" aria-hidden="true" />
                    {submitting ? "Saving…" : "Save address"}
                  </>
                )}
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
