"use client";

import { useSearchParams } from "next/navigation";
import { ShopExplorer } from "@/components/commerce/shop-explorer";
import { useCatalog } from "@/hooks/use-store-data";

export function ProductListing() {
  const searchParams = useSearchParams();
  const { error, loading, products } = useCatalog(true);

  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-10">
        <div className="mb-6 rounded-2xl bg-brand-green p-5 text-brand-ivory shadow-luxury sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            Rida Boutique
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-6xl">
            Shop the boutique.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-ivory/72">
            Search, filter, wishlist, and add premium pieces to your cart with Cash on Delivery checkout.
          </p>
        </div>
        {error ? (
          <div className="mb-5 rounded-2xl border border-brand-green/10 bg-white p-4 text-sm text-brand-charcoal/65 shadow-luxury">
            Showing local sample products because Supabase returned: {error}
          </div>
        ) : null}
        {loading ? (
          <div className="rounded-2xl border border-brand-green/10 bg-white p-8 text-sm font-semibold text-brand-green shadow-luxury">
            Loading catalog...
          </div>
        ) : (
          <ShopExplorer initialQuery={searchParams.get("query") || undefined} products={products} />
        )}
      </section>
    </main>
  );
}
