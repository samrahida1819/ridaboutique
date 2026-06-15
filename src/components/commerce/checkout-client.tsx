"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Landmark, MapPin, Smartphone, WalletCards } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency } from "@/lib/utils";
import type { Order, SavedAddress } from "@/types/commerce";

type CheckoutForm = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  pincode: string;
  coupon: string;
  paymentMethod: string;
};

const initialForm: CheckoutForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  district: "Srinagar",
  pincode: "",
  coupon: "",
  paymentMethod: "UPI"
};

const paymentMethods = [
  { label: "UPI", icon: Smartphone },
  { label: "Debit Card", icon: CreditCard },
  { label: "Credit Card", icon: CreditCard },
  { label: "Net Banking", icon: Landmark },
  { label: "Wallets", icon: WalletCards }
];

export function CheckoutClient() {
  const { authReady, isAuthenticated, requestLogin } = useAuth();
  const { addOrder, addSavedAddress, cart, clearCart, savedAddresses, subtotal } = useShop();
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderId: string; razorpayOrderId: string } | null>(null);

  const discount = form.coupon.trim().toUpperCase() === "RIDA10" ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal - discount > 4999 || subtotal === 0 ? 0 : 180;
  const total = Math.max(0, subtotal - discount + shipping);

  const steps = useMemo(
    () => [
      { label: "Customer", done: Boolean(form.fullName && form.phone) },
      { label: "Delivery", done: Boolean(form.address && form.district && form.pincode) },
      { label: "Payment", done: Boolean(form.paymentMethod) },
      { label: "Confirmation", done: Boolean(confirmation) }
    ],
    [confirmation, form]
  );

  function update<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (["fullName", "phone", "address", "district", "pincode"].includes(key)) {
      setSelectedAddressId("");
    }
  }

  function applySavedAddress(address: SavedAddress) {
    setSelectedAddressId(address.id);
    setSaveAddress(false);
    setForm((current) => ({
      ...current,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      district: address.district,
      pincode: address.pincode
    }));
    setErrors((current) => ({
      ...current,
      fullName: undefined,
      phone: undefined,
      address: undefined,
      district: undefined,
      pincode: undefined
    }));
    toast({ title: "Saved address selected", description: `${address.label} will be used for this order.` });
  }

  function validate() {
    const nextErrors: Partial<Record<keyof CheckoutForm, string>> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^[0-9+\-\s]{7,}$/.test(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.address.trim()) nextErrors.address = "Delivery address is required.";
    if (!/^[0-9]{6}$/.test(form.pincode)) nextErrors.pincode = "Enter a 6 digit PIN code.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cart.length) {
      toast({ kind: "info", title: "Your cart is empty", description: "Add items before checkout." });
      return;
    }

    if (!validate()) {
      toast({ kind: "info", title: "Checkout needs a few details", description: "Please review highlighted fields." });
      return;
    }

    if (saveAddress && !selectedAddressId && isAuthenticated) {
      const alreadySaved = savedAddresses.some(
        (address) =>
          address.phone === form.phone.trim() &&
          address.address.toLowerCase() === form.address.trim().toLowerCase() &&
          address.pincode === form.pincode.trim()
      );

      if (!alreadySaved) {
        const saved = await addSavedAddress({
          label: "Checkout address",
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          district: form.district,
          pincode: form.pincode.trim(),
          landmark: "",
          isDefault: savedAddresses.length === 0
        });
        if (!saved) {
          setSubmitting(false);
          return;
        }
      }
    }

    setSubmitting(true);
    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: total,
        customer: form,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          variant: item.variant
        }))
      })
    });
    setSubmitting(false);

    if (!response.ok) {
      toast({ kind: "info", title: "Payment order failed", description: "Please try again." });
      return;
    }

    const data = (await response.json()) as { orderId: string; razorpayOrderId: string };
    const order: Order = {
      date: new Date().toISOString(),
      id: data.orderId,
      items: cart.map((item) => ({
        name: item.product.name,
        quantity: item.quantity
      })),
      status: "Confirmed",
      total,
      trackingId: `KMR-${data.orderId.replace(/[^0-9A-Z]/gi, "").slice(-6)}`
    };

    addOrder(order);
    setConfirmation(data);
    clearCart();
    toast({ title: "Order confirmed", description: "Your Razorpay order has been created." });
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-brand-green/10 bg-white p-8 text-center shadow-luxury sm:rounded-[1.75rem] sm:p-12">
        <CheckCircle2 className="mx-auto size-12 text-brand-gold" />
        <h1 className="mt-5 font-serif text-3xl text-brand-green sm:text-5xl">Order Confirmed</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-charcoal/60">
          Your order {confirmation.orderId} is ready for fulfillment. Tracking will appear inside your profile once dispatched.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-brand-green/55">
          Razorpay Order: {confirmation.razorpayOrderId}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/orders">View Orders</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">
            Continue Shopping
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_390px] lg:gap-8">
      <form className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury md:rounded-[1.75rem] md:p-7" onSubmit={submitOrder}>
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              className="rounded-2xl border border-brand-green/10 bg-brand-ivory p-4"
              key={step.label}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green/55">
                Step {index + 1}
              </span>
              <p className="mt-2 flex items-center gap-2 font-serif text-2xl text-brand-green">
                {step.done ? <CheckCircle2 className="size-4 text-brand-gold" /> : null}
                {step.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field error={errors.fullName} label="Full Name">
            <Input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
          </Field>
          <Field error={errors.phone} label="Phone Number">
            <Input inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </Field>
          <Field error={errors.email} label="Email Address">
            <Input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
          </Field>
          <Field label="Guest or Account">
            <Select defaultValue="guest">
              <option value="guest">Guest checkout</option>
              <option value="account">Create / use account</option>
            </Select>
          </Field>
        </div>

        <div className="mt-7 rounded-3xl bg-brand-cream p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-brand-green">
                <MapPin className="size-4 text-brand-gold" />
                Saved delivery addresses
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-charcoal/55">
                Select a saved address or enter a new one below.
              </p>
            </div>
            <ButtonLink href="/account" size="sm" variant="secondary">
              Manage Addresses
            </ButtonLink>
          </div>

          {!authReady ? (
            <div className="mt-4 rounded-2xl border border-brand-green/10 bg-white p-4 text-sm font-semibold text-brand-green">
              Checking saved addresses...
            </div>
          ) : !isAuthenticated ? (
            <div className="mt-4 rounded-2xl border border-dashed border-brand-green/20 bg-white p-4">
              <p className="text-sm font-semibold text-brand-green">Sign in with WhatsApp to use saved addresses.</p>
              <p className="mt-1 text-xs leading-5 text-brand-charcoal/55">
                Guest checkout is still available with manual address entry.
              </p>
              <Button
                className="mt-3"
                onClick={() => requestLogin("Sign in with WhatsApp to use saved delivery addresses.")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Sign In
              </Button>
            </div>
          ) : savedAddresses.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {savedAddresses.map((address) => {
                const active = selectedAddressId === address.id;

                return (
                  <button
                    className={
                      active
                        ? "rounded-2xl border border-brand-gold bg-brand-green p-4 text-left text-brand-ivory"
                        : "rounded-2xl border border-brand-green/10 bg-white p-4 text-left text-brand-green transition hover:border-brand-gold"
                    }
                    key={address.id}
                    onClick={() => applySavedAddress(address)}
                    type="button"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-2xl">{address.label}</span>
                      {address.isDefault ? (
                        <span className="rounded-full bg-brand-gold px-3 py-1 text-[10px] font-bold uppercase text-brand-green">
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span className={active ? "mt-2 block text-sm leading-6 text-brand-ivory/70" : "mt-2 block text-sm leading-6 text-brand-charcoal/62"}>
                      {address.fullName}, {address.address}, {address.district} - {address.pincode}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-brand-green/20 bg-white p-4 text-sm leading-6 text-brand-charcoal/62">
              No saved addresses yet. Add one on your account page, or fill this checkout form and save it for later.
            </div>
          )}
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Field error={errors.address} label="Address">
            <Input value={form.address} onChange={(event) => update("address", event.target.value)} />
          </Field>
          <Field label="District">
            <Select value={form.district} onChange={(event) => update("district", event.target.value)}>
              {["Srinagar", "Budgam", "Baramulla", "Anantnag", "Pulwama", "Ganderbal", "Kupwara", "Shopian", "Kulgam"].map((district) => (
                <option key={district}>{district}</option>
              ))}
            </Select>
          </Field>
          <Field error={errors.pincode} label="PIN Code">
            <Input inputMode="numeric" value={form.pincode} onChange={(event) => update("pincode", event.target.value)} />
          </Field>
          <Field label="Coupon Code">
            <Input placeholder="Try RIDA10" value={form.coupon} onChange={(event) => update("coupon", event.target.value)} />
          </Field>
        </div>

        {!selectedAddressId && authReady && isAuthenticated ? (
          <label className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-cream p-4 text-sm font-semibold text-brand-green">
            <input
              checked={saveAddress}
              className="size-4 accent-brand-green"
              onChange={(event) => setSaveAddress(event.target.checked)}
              type="checkbox"
            />
            Save this address for future checkout
          </label>
        ) : !selectedAddressId && authReady ? (
          <div className="mt-5 rounded-2xl bg-brand-cream p-4">
            <p className="text-sm font-semibold text-brand-green">Want to save this address?</p>
            <p className="mt-1 text-xs leading-5 text-brand-charcoal/55">
              Sign in with WhatsApp first, then saved addresses will be available across checkout and account.
            </p>
            <Button
              className="mt-3"
              onClick={() => requestLogin("Sign in with WhatsApp to save delivery addresses.")}
              size="sm"
              type="button"
              variant="secondary"
            >
              Sign In With WhatsApp
            </Button>
          </div>
        ) : null}

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-green/65">
            Payment Method
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const active = form.paymentMethod === method.label;
              return (
                <button
                  className={active ? "flex items-center gap-3 rounded-2xl border border-brand-gold bg-brand-green p-4 text-left text-brand-ivory" : "flex items-center gap-3 rounded-2xl border border-brand-green/10 bg-brand-ivory p-4 text-left text-brand-green transition hover:border-brand-gold"}
                  key={method.label}
                  onClick={() => update("paymentMethod", method.label)}
                  type="button"
                >
                  <Icon className="size-5 text-brand-gold" />
                  <span className="text-sm font-semibold">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button className="mt-8 w-full md:w-auto" disabled={submitting} size="lg" type="submit">
          {submitting ? "Creating Payment..." : "Place Secure Order"}
        </Button>
      </form>

      <aside className="h-fit rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:rounded-[1.75rem] sm:p-6 lg:sticky lg:top-32">
        <p className="font-serif text-4xl text-brand-green">Order Summary</p>
        <div className="mt-6 grid gap-4">
          {cart.map((item) => (
            <div className="flex justify-between gap-4 text-sm" key={`${item.product.id}-${item.variant || "default"}`}>
              <span className="text-brand-charcoal/65">
                {item.quantity} x {item.product.name}
              </span>
              <span className="font-semibold text-brand-green">{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 border-t border-brand-green/10 pt-6 text-sm text-brand-charcoal/65">
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
          <SummaryRow label="Discount" value={discount ? `- ${formatCurrency(discount)}` : "Rs 0"} />
          <SummaryRow label="Delivery" value={shipping ? formatCurrency(shipping) : "Free"} />
        </div>
        <div className="mt-6 border-t border-brand-green/10 pt-6">
          <SummaryRow label="Total" value={formatCurrency(total)} strong />
        </div>
        <p className="mt-5 text-xs leading-5 text-brand-charcoal/55">
          Payments are routed through Razorpay. In development, the API returns a mock order when Razorpay secrets are not configured.
        </p>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-center justify-between text-lg font-semibold text-brand-green" : "flex items-center justify-between"}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
