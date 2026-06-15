"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Gem,
  Gift,
  ImageIcon,
  Link2,
  Mail,
  MapPin,
  Package,
  Phone,
  Shirt,
  UploadCloud,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { cloudinaryConfig } from "@/lib/cloudinary";
import { ADMIN_CUSTOM_ORDERS_KEY } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  productType: string;
  quantity: string;
  description: string;
  referenceLinks: string;
  budget: string;
  deliveryDate: string;
  deliveryArea: string;
  notes: string;
};

const productTypes = [
  {
    label: "Custom Earrings",
    hint: "Design, color, finish, occasion",
    pricing: "Price after contact",
    icon: Gem
  },
  {
    label: "Custom Frame",
    hint: "Photo frame, quote frame, size",
    pricing: "Price after contact",
    icon: ImageIcon
  },
  {
    label: "Cash Bouquet",
    hint: "Cash amount, wrapping, message",
    pricing: "Price after contact",
    icon: Gift
  },
  {
    label: "Personalized Gift",
    hint: "Name, date, message, theme",
    pricing: "Price after contact",
    icon: Package
  },
  {
    label: "Hijab",
    hint: "Fabric, color, styling need",
    pricing: "Price after contact",
    icon: Shirt
  },
  {
    label: "Fashion",
    hint: "Size, fabric, occasion, fit",
    pricing: "Price after contact",
    icon: Shirt
  },
  {
    label: "Accessories",
    hint: "Accessory type, color, finish",
    pricing: "Price after contact",
    icon: Gift
  }
];

const initialState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  productType: productTypes[0].label,
  quantity: "1",
  description: "",
  referenceLinks: "",
  budget: "",
  deliveryDate: "",
  deliveryArea: "",
  notes: ""
};

export function CustomOrderForm() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initialState);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedType = productTypes.find((type) => type.label === form.productType) || productTypes[0];
  const minDeliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split("T")[0];
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function selectProductType(type: string) {
    setForm((current) => ({
      ...current,
      productType: type
    }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^[0-9+\-\s]{7,}$/.test(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.quantity || Number(form.quantity) < 1) nextErrors.quantity = "Quantity must be at least 1.";
    if (form.description.trim().length < 30) nextErrors.description = "Please add at least 30 characters.";
    if (!form.deliveryDate) nextErrors.deliveryDate = "Preferred delivery date is required.";
    if (!form.deliveryArea.trim()) nextErrors.deliveryArea = "Delivery area is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveRequestToAdminQueue() {
    const request = {
      id: `CO-${Date.now().toString().slice(-5)}`,
      customer: form.fullName.trim(),
      type: form.productType,
      budget: form.budget.trim() || "Not shared",
      status: "Pending" as const,
      requestedFor: form.deliveryDate,
      internalNote: form.notes.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      quantity: Number(form.quantity) || 1,
      description: form.description.trim(),
      referenceImage: fileName,
      referenceLinks: form.referenceLinks.trim(),
      stage: "Request",
      quotedPrice: 0,
      advancePaid: 0,
      paymentStatus: "Unpaid"
    };

    try {
      const storedValue = window.localStorage.getItem(ADMIN_CUSTOM_ORDERS_KEY);
      const storedRequests = storedValue ? JSON.parse(storedValue) : [];
      const requests = Array.isArray(storedRequests) ? storedRequests : [];

      window.localStorage.setItem(ADMIN_CUSTOM_ORDERS_KEY, JSON.stringify([request, ...requests]));
      window.dispatchEvent(
        new CustomEvent("rida-admin-storage", { detail: { key: ADMIN_CUSTOM_ORDERS_KEY } })
      );
    } catch {
      window.localStorage.setItem(ADMIN_CUSTOM_ORDERS_KEY, JSON.stringify([request]));
      window.dispatchEvent(
        new CustomEvent("rida-admin-storage", { detail: { key: ADMIN_CUSTOM_ORDERS_KEY } })
      );
    }

    return request.id;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      toast({
        kind: "info",
        title: "Please review the form",
        description: "A few required details need attention."
      });
      return;
    }

    setSubmitting(true);
    const requestId = saveRequestToAdminQueue();
    let apiSaved = false;

    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, referenceImage: fileName, requestId })
      });

      apiSaved = response.ok;
    } catch {
      apiSaved = false;
    }

    setSubmitting(false);
    setForm(initialState);
    setFileName("");
    toast({
      title: "Custom request submitted",
      description: apiSaved
        ? "Team will review it and contact you with the final price before payment."
        : `Saved as ${requestId}. Admin can process it from Custom Orders.`
    });
  }

  return (
    <form
      className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury md:p-6"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2 border-b border-brand-green/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            Request Details
          </p>
          <h2 className="mt-2 font-serif text-2xl text-brand-green">Tell us what to make.</h2>
        </div>
        <p className="text-xs font-semibold text-brand-charcoal/55">Price after contact</p>
      </div>

      <div className="mt-6 space-y-7">
        <section>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-brand-green">Choose product type</p>
            <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-green">
              {selectedType.pricing}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {productTypes.map((type) => {
              const Icon = type.icon;
              const active = form.productType === type.label;

              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-20 items-start gap-3 rounded-xl border p-3 text-left transition",
                    active
                      ? "border-brand-gold bg-brand-green text-brand-ivory shadow-luxury"
                      : "border-brand-green/10 bg-brand-cream text-brand-green hover:border-brand-gold/45"
                  )}
                  key={type.label}
                  onClick={() => selectProductType(type.label)}
                  type="button"
                >
                  <Icon className={cn("size-5", active ? "text-brand-gold" : "text-brand-green/70")} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-tight">{type.label}</span>
                    <span className={cn("mt-1 block text-xs leading-5", active ? "text-brand-ivory/70" : "text-brand-charcoal/55")}>
                      {type.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Field error={errors.fullName} label="Full Name">
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/45" />
              <Input className="pl-11" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
            </div>
          </Field>
          <Field error={errors.phone} label="Phone Number">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/45" />
              <Input className="pl-11" inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </div>
          </Field>
          <Field error={errors.email} label="Email Address">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/45" />
              <Input className="pl-11" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            </div>
          </Field>
          <Field error={errors.deliveryArea} label="Delivery Area">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/45" />
              <Input className="pl-11" placeholder="Srinagar, Budgam, Baramulla..." value={form.deliveryArea} onChange={(event) => update("deliveryArea", event.target.value)} />
            </div>
          </Field>
        </section>

        <section className="grid gap-4 md:grid-cols-[0.75fr_1fr]">
          <Field error={errors.quantity} label="Quantity">
            <Input min={1} type="number" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} />
          </Field>
          <Field label="Product Type">
            <Select value={form.productType} onChange={(event) => selectProductType(event.target.value)}>
              {productTypes.map((type) => (
                <option key={type.label}>{type.label}</option>
              ))}
            </Select>
          </Field>
        </section>

        <Field error={errors.description} label="Description / Requirements">
          <Textarea
            className="min-h-44"
            placeholder="Occasion, colors, size, names/initials, message text, fabric/material, finish, and anything that must not be changed."
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </Field>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-brand-green/70">
              Reference Image Upload
            </span>
            <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-brand-gold/60 bg-brand-cream px-5 py-6 text-center text-sm font-semibold text-brand-green transition hover:bg-brand-champagne/45">
              <UploadCloud className="mb-3 size-6" />
              {fileName || "Upload reference image"}
              <span className="mt-2 max-w-xs text-xs font-normal leading-5 text-brand-charcoal/50">
                Photo, screenshot, logo, color palette, or design reference. Preset: {cloudinaryConfig.uploadPreset}
              </span>
            </span>
            <input
              accept="image/*"
              className="sr-only"
              type="file"
              onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
            />
          </label>
          <Field label="Reference Links">
            <div className="relative">
              <Link2 className="absolute left-4 top-4 size-4 text-brand-green/45" />
              <Textarea
                className="pl-11"
                placeholder="Instagram, Pinterest, product links, Google Drive, or any reference URLs."
                value={form.referenceLinks}
                onChange={(event) => update("referenceLinks", event.target.value)}
              />
            </div>
          </Field>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Field label="Budget Idea (Optional)">
            <Input placeholder="Optional: mention a comfortable range" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
          </Field>
          <Field error={errors.deliveryDate} label="Preferred Delivery Date">
            <div className="relative">
              <CalendarDays className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/45" />
              <Input className="pl-11" min={minDeliveryDate} type="date" value={form.deliveryDate} onChange={(event) => update("deliveryDate", event.target.value)} />
            </div>
          </Field>
        </section>

        <Field label="Additional Notes">
          <Textarea
            placeholder="Gift message, packaging preference, delivery timing, or anything the admin should know before pricing."
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 rounded-xl bg-brand-cream p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex gap-3 text-sm text-brand-charcoal/70">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-green" />
            <p>
              You are submitting a request only. We will contact you with the final price before payment.
            </p>
          </div>
          <Button className="w-full md:w-auto" disabled={submitting} size="lg" type="submit">
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </form>
  );
}
