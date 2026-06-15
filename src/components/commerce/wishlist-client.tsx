"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { AuthLoading, LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency } from "@/lib/utils";

export function WishlistClient() {
  const { authReady, isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist, moveWishlistToCart } = useShop();
  const { toast } = useToast();

  if (!authReady) {
    return <AuthLoading title="Checking your wishlist" />;
  }

  if (!isAuthenticated) {
    return (
      <LoginRequired
        description="Sign in to view saved products, move wishlist items to cart, and manage stock notifications."
        title="Sign in to view your wishlist"
      />
    );
  }

  if (!wishlist.length) {
    return (
      <div className="rounded-2xl border border-brand-green/10 bg-white p-8 text-center shadow-luxury sm:rounded-[1.75rem] sm:p-12">
        <Heart className="mx-auto size-10 text-brand-gold" />
        <h1 className="mt-5 font-serif text-3xl text-brand-green sm:text-5xl">Your wishlist is empty.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-charcoal/60">
          Save pieces for later, move them to cart, and receive stock notifications from your profile.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/shop">Discover Pieces</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {wishlist.map((product) => (
        <article className="grid grid-cols-[92px_1fr] gap-3 rounded-2xl border border-brand-green/10 bg-white p-3 shadow-[0_1px_0_rgba(6,40,31,0.08)] sm:grid-cols-[132px_1fr] sm:gap-4 sm:p-4" key={product.id}>
          <Link className="relative aspect-square overflow-hidden rounded-2xl bg-brand-cream" href={`/product/${product.slug}`}>
            <Image alt={product.name} className="object-cover" fill sizes="160px" src={product.image} />
          </Link>
          <div className="flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link className="font-serif text-xl text-brand-green transition hover:text-brand-gold sm:text-3xl" href={`/product/${product.slug}`}>
                  {product.name}
                </Link>
                <p className="mt-2 text-sm font-semibold text-brand-charcoal">{formatCurrency(product.price)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-green/55">{product.stockStatus}</p>
              </div>
              <Button
                aria-label={`Remove ${product.name}`}
                onClick={() => {
                  if (toggleWishlist(product)) {
                    toast({ title: "Removed from wishlist", description: product.name });
                  }
                }}
                size="icon"
                variant="secondary"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  if (moveWishlistToCart(product)) {
                    toast({ title: "Moved to cart", description: product.name });
                  }
                }}
              >
                <ShoppingBag className="size-4" />
                Move to Cart
              </Button>
              <Button
                onClick={() =>
                  toast({
                    kind: "info",
                    title: "Stock alert enabled",
                    description: `You will be notified about ${product.name}.`
                  })
                }
                variant="secondary"
              >
                <Bell className="size-4" />
                Stock Notify
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
