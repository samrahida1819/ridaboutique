"use client";

import { useMemo, useState } from "react";
import { Bell, Heart, Minus, Plus, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { requestLogin } = useAuth();
  const { addToCart, isWishlisted, toggleWishlist } = useShop();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.variants || []).map((variant) => [variant.label, variant.values[0]]))
  );

  const variantLabel = useMemo(
    () => Object.entries(selectedVariants).map(([label, value]) => `${label}: ${value}`).join(" / "),
    [selectedVariants]
  );

  const wishlisted = isWishlisted(product.id);
  const soldOut = product.stockStatus === "Sold out";

  return (
    <aside className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:rounded-[1.75rem] sm:p-6 lg:sticky lg:top-32">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge>{product.stockStatus}</Badge>
          <h1 className="mt-3 font-serif text-3xl leading-tight text-brand-green sm:text-4xl md:text-5xl">
            {product.name}
          </h1>
        </div>
        <Button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => {
            if (toggleWishlist(product)) {
              toast({
                title: wishlisted ? "Removed from wishlist" : "Saved to wishlist",
                description: product.name
              });
            }
          }}
          size="icon"
          variant="secondary"
        >
          <Heart className={wishlisted ? "size-4 fill-current" : "size-4"} />
        </Button>
      </div>

      <div className="mt-5 flex items-end gap-3">
        <p className="text-2xl font-semibold text-brand-charcoal">{formatCurrency(product.price)}</p>
        {product.originalPrice ? (
          <p className="pb-1 text-sm text-brand-charcoal/45 line-through">{formatCurrency(product.originalPrice)}</p>
        ) : null}
      </div>

      <p className="mt-5 text-sm leading-7 text-brand-charcoal/68">{product.description}</p>

      {product.variants?.length ? (
        <div className="mt-7 space-y-5">
          {product.variants.map((variant) => (
            <div key={variant.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-green/65">
                {variant.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {variant.values.map((value) => {
                  const active = selectedVariants[variant.label] === value;
                  return (
                    <button
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition",
                        active
                          ? "border-brand-gold bg-brand-green text-brand-ivory"
                          : "border-brand-green/15 bg-brand-ivory text-brand-green hover:border-brand-gold"
                      )}
                      key={value}
                      onClick={() =>
                        setSelectedVariants((current) => ({
                          ...current,
                          [variant.label]: value
                        }))
                      }
                      type="button"
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-green/65">
          Quantity
        </p>
        <div className="mt-3 inline-flex h-12 items-center rounded-full border border-brand-green/15 bg-brand-ivory">
          <Button
            aria-label="Decrease quantity"
            className="text-brand-green"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            size="icon"
            variant="ghost"
          >
            <Minus className="size-4" />
          </Button>
          <span className="grid w-12 place-items-center text-sm font-semibold">{quantity}</span>
          <Button
            aria-label="Increase quantity"
            className="text-brand-green"
            onClick={() => setQuantity((current) => current + 1)}
            size="icon"
            variant="ghost"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2">
        <Button
          className="sm:col-span-2"
          disabled={soldOut}
          onClick={() => {
            if (addToCart(product, quantity, variantLabel || undefined)) {
              toast({
                title: "Added to cart",
                description: `${quantity} x ${product.name}`
              });
            }
          }}
          size="lg"
        >
          <ShoppingBag className="size-4" />
          Add to Cart
        </Button>
        <Button
          onClick={() => {
            if (requestLogin("Sign in with WhatsApp to save stock alerts.")) {
              toast({
                kind: "info",
                title: "Back-in-stock alert saved",
                description: "We will notify you from your wishlist notifications."
              });
            }
          }}
          variant="secondary"
        >
          <Bell className="size-4" />
          Stock Alert
        </Button>
        <Button
          onClick={() =>
            toast({
              kind: "info",
              title: "360 view ready",
              description: "This product architecture supports future 360 assets."
            })
          }
          variant="outline"
        >
          360 View
        </Button>
      </div>

      <div className="mt-7 grid gap-3 border-t border-brand-green/10 pt-6 text-sm text-brand-charcoal/65">
        <p className="flex items-center gap-3">
          <Truck className="size-4 text-brand-gold" />
          Courier partner delivery across Kashmir with profile tracking.
        </p>
        <p className="flex items-center gap-3">
          <RotateCcw className="size-4 text-brand-gold" />
          {product.returnEligible
            ? "Return eligible under standard product policy."
            : "Custom and personalized item: no returns."}
        </p>
      </div>
    </aside>
  );
}
