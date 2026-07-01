"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, MessageCircle } from "lucide-react";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useContactDetails, useStoreSettings } from "@/hooks/use-store-data";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import type { Order, SavedAddress } from "@/types/commerce";

const DEFAULT_STATE = "Jammu and Kashmir";
const ONLINE_PAYMENT_ENABLED = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

type PaymentMethod = "razorpay";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

function savedAddressLine(address: SavedAddress) {
  const compact = [address.landmark, address.district, address.pincode]
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(", ");
  const existingAddress = address.address?.trim();

  if (existingAddress && existingAddress !== compact) {
    return [existingAddress, compact].filter(Boolean).join(", ");
  }

  return compact;
}

function manualAddressLine(form: CheckoutForm) {
  return [form.city, form.state, form.pincode]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

function checkoutFormFromSavedAddress(address: SavedAddress, email: string): CheckoutForm {
  return {
    fullName: address.fullName,
    email,
    phone: address.phone,
    address: savedAddressLine(address),
    city: address.district,
    state: DEFAULT_STATE,
    pincode: address.pincode
  };
}

export function CheckoutClient() {
  const { authReady, isAuthenticated, user } = useAuth();
  const { addOrder, cart, clearCart, savedAddresses, subtotal } = useShop();
  const settings = useStoreSettings();
  const { contactDetails } = useContactDetails();
  const [form, setForm] = useState<CheckoutForm>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: DEFAULT_STATE,
    pincode: ""
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<Order | null>(null);

  const deliveryCharges = settings.deliveryCharges || 0;
  const total = useMemo(() => subtotal + deliveryCharges, [deliveryCharges, subtotal]);
  const selectedAddress = useMemo(
    () => savedAddresses.find((address) => address.id === selectedAddressId),
    [savedAddresses, selectedAddressId]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || ""
    }));
  }, [user]);

  useEffect(() => {
    const defaultAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];

    if (!defaultAddress || selectedAddressId || form.city || form.pincode) {
      return;
    }

    setSelectedAddressId(defaultAddress.id);
    setForm((current) => checkoutFormFromSavedAddress(defaultAddress, current.email || user?.email || ""));
  }, [form.city, form.pincode, savedAddresses, selectedAddressId, user?.email]);

  function updateField(field: keyof CheckoutForm, value: string) {
    if (field === "phone" || field === "city" || field === "state" || field === "pincode") {
      setSelectedAddressId(null);
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  function applySavedAddress(address: SavedAddress) {
    setSelectedAddressId(address.id);
    setForm((current) => checkoutFormFromSavedAddress(address, current.email || user?.email || ""));
  }

  async function persistOrder(method: PaymentMethod, paymentStatus: string) {
    if (!user) {
      throw new Error("Please sign in before buying.");
    }

    const orderNumber = `RB-${Date.now().toString().slice(-7)}`;
    const deliveryAddress = selectedAddress ? savedAddressLine(selectedAddress) : manualAddressLine(form);
    const orderStatus = paymentStatus === "paid" ? "Packed" : "Pending";
    const localOrder: Order = {
      id: orderNumber,
      date: new Date().toISOString(),
      total,
      status: orderStatus,
      customerName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: deliveryAddress,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      paymentMethod: method,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price
      }))
    };

    if (hasSupabaseConfig()) {
      const supabase = getSupabaseBrowserClient();
      const { data, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          address: deliveryAddress,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          payment_method: method,
          payment_status: paymentStatus,
          status: orderStatus,
          subtotal,
          delivery_charges: deliveryCharges,
          total
        })
        .select("id, order_number, created_at")
        .single();

      if (orderError) {
        throw orderError;
      }

      const orderId = data.id;
      const { error: itemError } = await supabase.from("order_items").insert(
        cart.map((item) => ({
          order_id: orderId,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.salePrice || item.product.price,
          total: (item.product.salePrice || item.product.price) * item.quantity
        }))
      );

      if (itemError) {
        throw itemError;
      }

      localOrder.id = data.order_number || orderNumber;
      localOrder.date = data.created_at || localOrder.date;
    }

    return localOrder;
  }

  function finalizeOrder(order: Order) {
    addOrder(order);
    clearCart();
    setConfirmation(order);
  }

  async function payWithRazorpay() {
    const receipt = `RB-${Date.now().toString().slice(-7)}`;
    const response = await fetch("/api/checkout/create-order", {
      body: JSON.stringify({ amount: total, receipt }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const data = (await response.json().catch(() => ({}))) as {
      orderId?: string;
      amount?: number;
      currency?: string;
      keyId?: string;
      error?: string;
    };

    if (!response.ok || !data.orderId || !data.keyId) {
      throw new Error(data.error || "Unable to start online payment.");
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Could not load the payment gateway. Check your connection.");
    }

    await new Promise<void>((resolve, reject) => {
      const checkout = new window.Razorpay!({
        key: data.keyId!,
        amount: data.amount!,
        currency: data.currency || "INR",
        name: settings.storeName || "Rida Boutique",
        description: "Order payment",
        order_id: data.orderId!,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: "#06281f" },
        handler: (payment) => {
          void (async () => {
            try {
              const verifyResponse = await fetch("/api/checkout/verify", {
                body: JSON.stringify({
                  orderId: payment.razorpay_order_id,
                  paymentId: payment.razorpay_payment_id,
                  signature: payment.razorpay_signature
                }),
                headers: { "Content-Type": "application/json" },
                method: "POST"
              });

              if (!verifyResponse.ok) {
                const verifyData = (await verifyResponse.json().catch(() => ({}))) as { error?: string };
                throw new Error(verifyData.error || "Payment verification failed.");
              }

              const order = await persistOrder("razorpay", "paid");
              finalizeOrder(order);
              resolve();
            } catch (nextError) {
              reject(nextError instanceof Error ? nextError : new Error("Payment failed."));
            }
          })();
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled."))
        }
      });

      checkout.on("payment.failed", (response) => {
        reject(new Error(response?.error?.description || "Payment failed. Please try again."));
      });

      checkout.open();
    });
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Please sign in before buying.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    const requiredFields: Array<keyof CheckoutForm> = ["fullName", "email", "phone", "city", "state", "pincode"];
    if (requiredFields.some((field) => !form[field].trim())) {
      setError("Please fill all delivery details.");
      return;
    }

    if (!ONLINE_PAYMENT_ENABLED) {
      setError("Online payment is not available right now. Please contact the store to complete your order.");
      return;
    }

    setPlacing(true);

    try {
      await payWithRazorpay();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to place order.");
    } finally {
      setPlacing(false);
    }
  }

  if (!authReady) {
    return <div className="app-container pb-12 pt-32 md:pt-40">Loading buy now...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <LoginRequired description="Sign in with email and password before buying." title="Buy now requires login" />
      </div>
    );
  }

  if (confirmation) {
    const whatsappMessage = [
      `Hello ${contactDetails.storeName || "Rida Boutique"}! I just placed an order.`,
      `Order: ${confirmation.id}`,
      `Name: ${confirmation.customerName}`,
      `Phone: ${confirmation.phone}`,
      `Total: ${formatCurrency(confirmation.total)}`,
      "",
      "Items:",
      ...confirmation.items.map((item) => `- ${item.name} x ${item.quantity}`),
      "",
      "Please confirm my order. Thank you!"
    ].join("\n");
    const whatsappUrl = buildWhatsappUrl(contactDetails.whatsappNumber, whatsappMessage);

    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-xl rounded-lg border border-stone-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
          <CheckCircle2 className="mx-auto size-12" />
          <h1 className="mt-5 text-2xl font-semibold">Order placed</h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
            Your order {confirmation.id} has been placed.
          </p>
          {whatsappUrl ? (
            <>
              <a
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe5b] active:scale-[0.98]"
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="size-5" />
                Confirm on WhatsApp
              </a>
              <p className="mt-2 text-xs text-stone-500">
                Send us a quick WhatsApp so we can confirm and pack your order faster.
              </p>
            </>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ButtonLink href="/orders" variant="outline">View orders</ButtonLink>
            <ButtonLink href="/products">Continue shopping</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <h1 className="text-3xl font-semibold tracking-tight">Buy now</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950" onSubmit={placeOrder}>
          <div className="rounded-lg border border-stone-200 p-4 dark:border-neutral-800">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Saved address</h2>
                <p className="mt-1 text-sm text-stone-500">Select a saved address or fill the details below.</p>
              </div>
              <ButtonLink className="w-full sm:w-auto" href="/account" variant="secondary">
                Add address
              </ButtonLink>
            </div>

            {savedAddresses.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {savedAddresses.map((address) => {
                  const selected = selectedAddressId === address.id;

                  return (
                    <button
                      aria-pressed={selected}
                      className={`rounded-lg border p-3 text-left transition ${
                        selected
                          ? "border-brand-gold bg-brand-cream text-brand-green"
                          : "border-stone-200 hover:border-brand-gold dark:border-neutral-800"
                      }`}
                      key={address.id}
                      onClick={() => applySavedAddress(address)}
                      type="button"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-serif text-xl">{address.label}</span>
                          <span className="mt-1 block text-sm font-semibold">{address.fullName}</span>
                        </span>
                        <span className={`mt-1 grid size-5 place-items-center rounded-full border ${selected ? "border-brand-green bg-brand-green" : "border-stone-300"}`}>
                          {selected ? <span className="size-2 rounded-full bg-brand-ivory" /> : null}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm text-brand-charcoal/65">{address.phone}</span>
                      <span className="mt-1 block text-sm text-brand-charcoal/65">{savedAddressLine(address)}</span>
                      {address.isDefault ? (
                        <span className="mt-3 inline-flex rounded-full bg-brand-gold px-2 py-1 text-[10px] font-bold uppercase text-brand-green">
                          Default
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-brand-cream p-3 text-sm text-brand-green">
                No saved address yet. Add one from My Account or enter delivery details below.
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} required />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
            </Field>
            <Field label="Phone number">
              <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
            </Field>
            <Field label="District">
              <Input value={form.city} onChange={(event) => updateField("city", event.target.value)} required />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={(event) => updateField("state", event.target.value)} required />
            </Field>
            <Field label="Pincode">
              <Input inputMode="numeric" value={form.pincode} onChange={(event) => updateField("pincode", event.target.value)} required />
            </Field>
          </div>
          <div className="rounded-lg border border-stone-200 p-4 dark:border-neutral-800">
            <h2 className="font-semibold">Payment</h2>
            <div className="mt-3 flex items-start gap-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <CreditCard className="mt-0.5 size-5 shrink-0 text-brand-green" />
              <span>
                <span className="block font-semibold">Pay online (Razorpay)</span>
                <span className="block text-stone-500">Secure payment via UPI, cards, netbanking, and wallets. Your order is confirmed after payment.</span>
              </span>
            </div>
            {!ONLINE_PAYMENT_ENABLED ? (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                Online payment is not configured yet. Add Razorpay keys to enable checkout.
              </p>
            ) : null}
          </div>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          <Button disabled={placing || !cart.length || !ONLINE_PAYMENT_ENABLED} size="lg" type="submit">
            {placing ? "Opening payment..." : `Pay ${formatCurrency(total)}`}
          </Button>
        </form>

        <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {cart.map((item) => (
              <div className="flex justify-between gap-3" key={`${item.product.id}-${item.variant || "default"}`}>
                <span>{item.product.name} x {item.quantity}</span>
                <span>{formatCurrency((item.product.salePrice || item.product.price) * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-stone-200 pt-3 dark:border-neutral-800" />
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Delivery</span>
              <span>{formatCurrency(deliveryCharges)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
