"use client";

import { useSearchParams } from "next/navigation";
import { ShopExplorer } from "@/components/commerce/shop-explorer";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/hooks/use-store-data";

export function ProductListing() {
  const searchParams = useSearchParams();
  const { error, loading, products } = useCatalog(true);
  const showLoadingState = loading && products.length === 0;

  return (
    <main className="min-h-screen bg-brand-ivory pt-28 sm:pt-32 md:pt-40">
      <section className="luxury-container pb-8 sm:pb-10">
        <div className="hero-glow mb-4 overflow-hidden rounded-xl bg-brand-green p-4 text-brand-ivory shadow-luxury sm:mb-6 sm:rounded-2xl sm:p-7">
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
            Couldn&apos;t load the catalog: {error}
          </div>
        ) : null}
        {showLoadingState ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="rounded-xl bg-white p-2 ring-1 ring-brand-green/8 sm:rounded-2xl sm:p-3" key={index}>
                <Skeleton className="aspect-square w-full rounded-lg sm:rounded-xl" />
                <Skeleton className="mt-3 h-4 w-4/5 rounded-md" />
                <Skeleton className="mt-2 h-4 w-1/3 rounded-md" />
                <Skeleton className="mt-3 h-9 w-full rounded-full sm:h-10" />
              </div>
            ))}
          </div>
        ) : (
          <ShopExplorer initialQuery={searchParams.get("query") || undefined} products={products} />
        )}
      </section>
    </main>
  );
}
