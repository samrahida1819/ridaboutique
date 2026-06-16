"use client";

import { useSearchParams } from "next/navigation";
import { ShopExplorer } from "@/components/commerce/shop-explorer";
import { useCatalog } from "@/hooks/use-store-data";

export function ProductListing() {
  const searchParams = useSearchParams();
  const { error, loading, products } = useCatalog(true);
  const showLoadingState = loading && products.length === 0;

  return (
    <main className="min-h-screen bg-brand-ivory pt-28 sm:pt-32 md:pt-40">
      <section className="luxury-container pb-8 sm:pb-10">
        <div className="mb-4 rounded-xl bg-brand-green p-4 text-brand-ivory shadow-luxury sm:mb-6 sm:rounded-2xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            Rida Boutique
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight sm:mt-3 sm:text-6xl">
            Shop the boutique.
          </h1>
          <p className="mt-3 max-w-[21rem] text-sm leading-7 text-brand-ivory/72 sm:max-w-2xl">
            Premium pieces, custom gifts, and simple ordering in one clean catalog.
          </p>
        </div>
        {error ? (
          <div className="mb-5 rounded-2xl border border-brand-green/10 bg-white p-4 text-sm text-brand-charcoal/65 shadow-luxury">
            Showing local sample products because Supabase returned: {error}
          </div>
        ) : null}
        {showLoadingState ? (
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
