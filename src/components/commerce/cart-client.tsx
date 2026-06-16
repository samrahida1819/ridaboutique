"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { LoginRequired } from "@/components/providers/auth-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CartClient() {
  const { authReady, isAuthenticated } = useAuth();
  const { cart, cartCount, removeFromCart, subtotal, updateQuantity } = useShop();

  if (!authReady) {
    return <div className="app-container pb-12 pt-32 md:pt-40">Loading cart...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <LoginRequired description="Sign in with email and password to view your cart and continue checkout." title="Your cart is private" />
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <div className="rounded-lg border border-stone-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-950">
          <ShoppingBag className="mx-auto size-10" />
          <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Add products to cart before checkout.</p>
          <ButtonLink className="mt-6" href="/products">
            Shop products
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{cartCount} item{cartCount === 1 ? "" : "s"} ready for checkout.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {cart.map((item) => (
            <article className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 sm:grid-cols-[110px_1fr_auto]" key={`${item.product.id}-${item.variant || "default"}`}>
              <div className="relative aspect-square overflow-hidden rounded-md bg-stone-100 dark:bg-neutral-900">
                <Image alt={item.product.name} className="object-cover" fill sizes="110px" src={item.product.image} />
              </div>
              <div>
                <Link className="font-medium hover:underline" href={`/products/${item.product.slug}`}>
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm text-stone-500">{item.variant || item.product.categoryName || item.product.category}</p>
                <p className="mt-3 font-semibold">{formatCurrency(item.product.salePrice || item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-between">
                <div className="flex items-center rounded-md border border-stone-200 dark:border-neutral-800">
                  <Button aria-label="Decrease quantity" onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} size="icon" variant="ghost">
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-10 text-center text-sm">{item.quantity}</span>
                  <Button aria-label="Increase quantity" onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} size="icon" variant="ghost">
                    <Plus className="size-4" />
                  </Button>
                </div>
                <Button aria-label="Remove item" onClick={() => removeFromCart(item.product.id, item.variant)} size="icon" variant="ghost">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Delivery</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <ButtonLink className="mt-6 w-full" href="/checkout">
            Checkout
          </ButtonLink>
        </aside>
      </div>
    </section>
  );
}
