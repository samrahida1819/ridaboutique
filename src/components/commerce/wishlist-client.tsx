"use client";

import { Heart } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { useShop } from "@/components/providers/shop-provider";

export function WishlistClient() {
  const { authReady, isAuthenticated } = useAuth();
  const { wishlist } = useShop();

  if (!authReady) {
    return <div className="app-container pb-12 pt-32 md:pt-40">Loading wishlist...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <LoginRequired description="Sign in to save and revisit wishlist products." title="Wishlist" />
      </div>
    );
  }

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
      {wishlist.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-stone-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-950">
          <Heart className="mx-auto size-10" />
          <h2 className="mt-4 text-xl font-semibold">No wishlist products</h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Save products you want to revisit later.</p>
          <ButtonLink className="mt-6" href="/products">Browse products</ButtonLink>
        </div>
      )}
    </section>
  );
}
