"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { ProductThumb } from "@/components/commerce/product-thumb";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency } from "@/lib/utils";

export function WishlistClient() {
  const { authReady, isAuthenticated } = useAuth();
  const { moveWishlistToCart, toggleWishlist, wishlist } = useShop();
  const { toast } = useToast();

  if (!authReady) {
    return <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">Loading wishlist...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">
        <LoginRequired description="Sign in to save and revisit wishlist products." title="Wishlist" />
      </div>
    );
  }

  return (
    <section className="app-container bg-brand-ivory pb-12 pt-28 sm:pt-32 md:pt-40">
      <div className="rounded-xl bg-brand-green p-4 text-brand-ivory shadow-luxury sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">Saved pieces</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">Wishlist</h1>
            <p className="mt-2 text-sm leading-6 text-brand-ivory/72">
              {wishlist.length} saved item{wishlist.length === 1 ? "" : "s"} ready to revisit.
            </p>
          </div>
          <ButtonLink className="w-full sm:w-auto" href="/products" variant="gold">
            Browse more
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </div>

      {wishlist.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((product) => (
            <article
              className="grid grid-cols-[96px_1fr] gap-3 rounded-xl border border-brand-green/10 bg-white p-3 shadow-[0_1px_0_rgba(6,40,31,0.08)] sm:grid-cols-1 sm:p-4"
              key={product.id}
            >
              <Link className="relative block" href={`/products/${product.slug}`}>
                <ProductThumb
                  alt={product.name}
                  className="aspect-square transition duration-700 hover:scale-[1.01]"
                  fallbackLabel={product.name}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 96px"
                  src={product.image}
                />
                <span className="absolute left-2 top-2 rounded-full bg-brand-gold px-2 py-1 text-[10px] font-bold uppercase text-brand-green">
                  Saved
                </span>
              </Link>
              <div className="min-w-0">
                <Link className="line-clamp-2 font-serif text-xl leading-tight text-brand-green transition hover:text-brand-gold" href={`/products/${product.slug}`}>
                  {product.name}
                </Link>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold">
                  {product.categoryName || product.category}
                </p>
                <p className="mt-3 font-bold text-brand-charcoal">
                  {formatCurrency(product.salePrice || product.price)}
                </p>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                  <Button
                    className="h-10 px-3 text-xs"
                    onClick={() => {
                      if (moveWishlistToCart(product)) {
                        toast({ title: "Moved to cart", description: product.name });
                      }
                    }}
                  >
                    <ShoppingBag className="size-4" />
                    Add
                  </Button>
                  <Button
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="size-10 text-brand-charcoal/55 hover:text-red-700"
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
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-brand-green/10 bg-white p-6 text-center shadow-luxury sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-cream text-brand-green">
            <Heart className="size-7" />
          </span>
          <h2 className="mt-4 font-serif text-3xl text-brand-green">No wishlist products</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brand-charcoal/62">Save products you want to revisit later.</p>
          <ButtonLink className="mt-6 w-full sm:w-auto" href="/products">Browse products</ButtonLink>
        </div>
      )}
    </section>
  );
}
