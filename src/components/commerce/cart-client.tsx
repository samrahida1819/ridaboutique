"use client";

import Link from "next/link";
import { ArrowRight, Heart, Minus, PackageCheck, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductThumb } from "@/components/commerce/product-thumb";
import { LoginRequired } from "@/components/providers/auth-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CartClient() {
  const { authReady, isAuthenticated } = useAuth();
  const { cart, cartCount, removeFromCart, subtotal, updateQuantity } = useShop();

  if (!authReady) {
    return <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">Loading cart...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">
        <LoginRequired description="Sign in with email and password to view your cart and buy products." title="Your cart is private" />
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">
        <div className="rounded-xl border border-brand-green/10 bg-white p-6 text-center shadow-luxury sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-cream text-brand-green">
            <ShoppingBag className="size-7" />
          </span>
          <h1 className="mt-4 font-serif text-3xl text-brand-green">Your cart is empty</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brand-charcoal/62">Add products to cart before buying.</p>
          <ButtonLink className="mt-6 w-full sm:w-auto" href="/products">
            Shop products
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <section className="app-container bg-brand-ivory pb-12 pt-28 sm:pt-32 md:pt-40">
      <div className="rounded-xl bg-brand-green p-4 text-brand-ivory shadow-luxury sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">Shopping bag</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">Cart</h1>
            <p className="mt-2 text-sm leading-6 text-brand-ivory/72">
              {cartCount} item{cartCount === 1 ? "" : "s"} ready to buy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-64">
            <div className="rounded-lg border border-brand-gold/25 bg-white/10 p-3">
              <span className="block text-xs text-brand-ivory/62">Items</span>
              <span className="mt-1 block font-semibold">{cartCount}</span>
            </div>
            <div className="rounded-lg border border-brand-gold/25 bg-white/10 p-3">
              <span className="block text-xs text-brand-ivory/62">Subtotal</span>
              <span className="mt-1 block font-semibold">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="grid gap-3">
          {cart.map((item) => (
            <article
              className="grid grid-cols-[94px_1fr] gap-3 rounded-xl border border-brand-green/10 bg-white p-3 shadow-[0_1px_0_rgba(6,40,31,0.08)] sm:grid-cols-[120px_1fr_auto] sm:p-4"
              key={`${item.product.id}-${item.variant || "default"}`}
            >
              <ProductThumb
                alt={item.product.name}
                className="aspect-square"
                fallbackLabel={item.product.name}
                sizes="120px"
                src={item.product.image}
              />
              <div className="min-w-0">
                <Link className="line-clamp-2 font-serif text-xl leading-tight text-brand-green transition hover:text-brand-gold" href={`/products/${item.product.slug}`}>
                  {item.product.name}
                </Link>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold">
                  {item.variant || item.product.categoryName || item.product.category}
                </p>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="font-bold text-brand-charcoal">
                    {formatCurrency((item.product.salePrice || item.product.price) * item.quantity)}
                  </p>
                  <p className="text-xs text-brand-charcoal/50">
                    {formatCurrency(item.product.salePrice || item.product.price)} each
                  </p>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-2 border-t border-brand-green/10 pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:pt-0">
                <div className="flex items-center rounded-full border border-brand-green/10 bg-brand-cream">
                  <Button aria-label="Decrease quantity" className="size-9" onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} size="icon" variant="ghost">
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-9 text-center text-sm font-semibold text-brand-green">{item.quantity}</span>
                  <Button aria-label="Increase quantity" className="size-9" onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} size="icon" variant="ghost">
                    <Plus className="size-4" />
                  </Button>
                </div>
                <Button aria-label="Remove item" className="size-9 text-brand-charcoal/55 hover:text-red-700" onClick={() => removeFromCart(item.product.id, item.variant)} size="icon" variant="ghost">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury lg:sticky lg:top-28">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand-green text-brand-ivory">
              <PackageCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-2xl text-brand-green">Order summary</h2>
              <p className="text-xs text-brand-charcoal/55">Ready to order</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-charcoal/55">Subtotal</span>
              <span className="font-semibold text-brand-green">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-charcoal/55">Delivery</span>
              <span className="text-right">Calculated on order page</span>
            </div>
          </div>
          <ButtonLink className="mt-6 w-full" href="/checkout">
            Buy now
            <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink className="mt-3 w-full" href="/wishlist" variant="secondary">
            <Heart className="size-4" />
            Wishlist
          </ButtonLink>
        </aside>
      </div>
    </section>
  );
}
