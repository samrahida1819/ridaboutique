"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, WalletCards } from "lucide-react";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useStoreSettings } from "@/hooks/use-store-data";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/types/commerce";

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "cod";
};

export function CheckoutClient() {
  const { authReady, isAuthenticated, user } = useAuth();
  const { addOrder, cart, clearCart, subtotal } = useShop();
  const settings = useStoreSettings();
  const [form, setForm] = useState<CheckoutForm>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod"
  });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<Order | null>(null);

  const deliveryCharges = settings.deliveryCharges || 0;
  const total = useMemo(() => subtotal + deliveryCharges, [deliveryCharges, subtotal]);

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Please sign in before checkout.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!settings.codEnabled) {
      setError("Cash on Delivery is currently disabled.");
      return;
    }

    const requiredFields: Array<keyof CheckoutForm> = ["fullName", "email", "phone", "address", "city", "state", "pincode"];
    if (requiredFields.some((field) => !form[field].trim())) {
      setError("Please fill all checkout fields.");
      return;
    }

    setPlacing(true);

    try {
      const orderNumber = `RB-${Date.now().toString().slice(-7)}`;
      const localOrder: Order = {
        id: orderNumber,
        date: new Date().toISOString(),
        total,
        status: "Pending",
        customerName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        paymentMethod: "cod",
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
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            payment_method: "cod",
            payment_status: "pending",
            status: "Pending",
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

      addOrder(localOrder);
      clearCart();
      setConfirmation(localOrder);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to place order.");
    } finally {
      setPlacing(false);
    }
  }

  if (!authReady) {
    return <div className="app-container pb-12 pt-32 md:pt-40">Loading checkout...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <LoginRequired description="Sign in with email and password before checkout." title="Checkout requires login" />
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-xl rounded-lg border border-stone-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
          <CheckCircle2 className="mx-auto size-12" />
          <h1 className="mt-5 text-2xl font-semibold">Order placed</h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
            Your order {confirmation.id} has been placed with Cash on Delivery.
          </p>
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
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950" onSubmit={placeOrder}>
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
            <Field label="City">
              <Input value={form.city} onChange={(event) => updateField("city", event.target.value)} required />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={(event) => updateField("state", event.target.value)} required />
            </Field>
            <Field label="Pincode">
              <Input inputMode="numeric" value={form.pincode} onChange={(event) => updateField("pincode", event.target.value)} required />
            </Field>
          </div>
          <Field label="Full address">
            <Textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} required />
          </Field>
          <div className="rounded-lg border border-stone-200 p-4 dark:border-neutral-800">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <WalletCards className="size-4" />
              Payment method
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input checked readOnly type="radio" />
              Cash on Delivery
            </label>
            <p className="mt-2 text-xs text-stone-500">Razorpay code structure is reserved for future activation, but not enabled.</p>
          </div>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          <Button disabled={placing || !cart.length} size="lg" type="submit">
            {placing ? "Placing order..." : "Place order"}
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
