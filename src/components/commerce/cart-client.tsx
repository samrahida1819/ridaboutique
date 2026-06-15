"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { AuthLoading, LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency } from "@/lib/utils";

export function CartClient() {
  const { authReady, isAuthenticated } = useAuth();
  const { cart, subtotal, removeFromCart, updateQuantity } = useShop();
  const { toast } = useToast();
  const shipping = subtotal > 4999 || subtotal === 0 ? 0 : 180;
  const total = subtotal + shipping;

  if (!authReady) {
    return <AuthLoading title="Checking your cart" />;
  }

  if (!isAuthenticated) {
    return (
      <LoginRequired
        description="Sign in with WhatsApp to add items, view your cart, and continue checkout."
        title="Sign in to view your cart"
      />
    );
  }

  if (!cart.length) {
    return (
      <div className="rounded-2xl border border-brand-green/10 bg-white p-8 text-center shadow-luxury sm:rounded-[1.75rem] sm:p-12">
        <ShoppingBag className="mx-auto size-10 text-brand-gold" />
        <h1 className="mt-5 font-serif text-3xl text-brand-green sm:text-5xl">Your cart is quiet.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-charcoal/60">
          Add fashion, hijabs, accessories, or custom-ready pieces to begin a premium checkout.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/shop">Shop Now</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-8">
      <div className="grid gap-4">
        {cart.map((item) => (
          <article className="grid grid-cols-[92px_1fr] gap-3 rounded-2xl border border-brand-green/10 bg-white p-3 shadow-[0_1px_0_rgba(6,40,31,0.08)] sm:grid-cols-[132px_1fr] sm:gap-4 sm:p-4" key={`${item.product.id}-${item.variant || "default"}`}>
            <Link className="relative aspect-square overflow-hidden rounded-2xl bg-brand-cream" href={`/product/${item.product.slug}`}>
              <Image alt={item.product.name} className="object-cover" fill sizes="160px" src={item.product.image} />
            </Link>
            <div className="flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link className="font-serif text-xl text-brand-green transition hover:text-brand-gold sm:text-3xl" href={`/product/${item.product.slug}`}>
                    {item.product.name}
                  </Link>
                  {item.variant ? <p className="mt-1 text-xs text-brand-charcoal/55">{item.variant}</p> : null}
                  <p className="mt-2 text-sm font-semibold text-brand-charcoal">{formatCurrency(item.product.price)}</p>
                </div>
                <Button
                  aria-label={`Remove ${item.product.name}`}
                  onClick={() => {
                    removeFromCart(item.product.id);
                    toast({ title: "Removed from cart", description: item.product.name });
                  }}
                  size="icon"
                  variant="secondary"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex h-11 items-center rounded-full border border-brand-green/15 bg-brand-ivory">
                  <Button
                    aria-label="Decrease quantity"
                    className="text-brand-green"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    size="icon"
                    variant="ghost"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="grid w-10 place-items-center text-sm font-semibold">{item.quantity}</span>
                  <Button
                    aria-label="Increase quantity"
                    className="text-brand-green"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    size="icon"
                    variant="ghost"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <p className="text-sm font-semibold text-brand-green">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:rounded-[1.75rem] sm:p-6 lg:sticky lg:top-32">
        <p className="font-serif text-4xl text-brand-green">Order Summary</p>
        <div className="mt-6 grid gap-3 text-sm">
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
          <SummaryRow label="Courier delivery" value={shipping ? formatCurrency(shipping) : "Free"} />
          <SummaryRow label="Kashmir delivery" value="Supported" />
        </div>
        <div className="mt-6 border-t border-brand-green/10 pt-6">
          <SummaryRow label="Total" value={formatCurrency(total)} strong />
        </div>
        <ButtonLink className="mt-6 w-full" href="/checkout" size="lg">
          Proceed to Checkout
        </ButtonLink>
        <p className="mt-4 text-xs leading-5 text-brand-charcoal/55">
          Razorpay supports UPI, cards, net banking, and wallets. Custom orders are paid after admin approval.
        </p>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-center justify-between text-lg font-semibold text-brand-green" : "flex items-center justify-between text-brand-charcoal/65"}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
