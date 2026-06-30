"use client";

import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { ProductPurchasePanel } from "@/components/commerce/product-purchase-panel";
import { ProductReviewsClient } from "@/components/commerce/product-reviews-client";
import { ButtonLink } from "@/components/ui/button";
import { useCatalog } from "@/hooks/use-store-data";

export function ProductDetailClient({ slug }: { slug: string }) {
  const { loading, products } = useCatalog(true);
  const product = products.find((item) => item.slug === slug);
  const related = useMemo(() => {
    if (!product) {
      return [];
    }
    return products
      .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
      .slice(0, 4);
  }, [products, product]);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
        <section className="luxury-container pb-16">
          <div className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-luxury">
            <p className="text-sm font-semibold text-brand-green">Loading product...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
        <section className="luxury-container pb-16">
          <div className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-luxury">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              Product
            </p>
            <h1 className="mt-2 font-serif text-3xl text-brand-green">Product not found</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-brand-charcoal/62">
              This product is not available in the current catalog.
            </p>
            <ButtonLink className="mt-5" href="/products">
              Back to Products
            </ButtonLink>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container grid gap-6 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 md:pb-20">
        <ProductGallery images={product.images} name={product.name} videoUrl={product.videoUrl} />
        <ProductPurchasePanel product={product} />
      </section>

      <section className="bg-white py-10 md:py-12">
        <div className="luxury-container grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              Details
            </p>
            <h2 className="mt-2 font-serif text-3xl text-brand-green sm:text-4xl">
              Designed with care, finished with restraint.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/62">
              A concise product dossier for confident buying.
            </p>
          </div>
          <div className="grid gap-4">
            {(product.details.length ? product.details : ["Premium boutique finish", "Email login required", "Simple order flow"]).map((detail) => (
              <div className="rounded-2xl border border-brand-green/10 bg-brand-ivory p-5" key={detail}>
                <p className="text-sm text-brand-charcoal/72">{detail}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-brand-green/10 bg-brand-green p-5 text-brand-ivory">
              <p className="flex items-center gap-3 text-sm">
                <ShieldCheck className="size-5 text-brand-gold" />
                Product, order, and customer access are protected by Supabase authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="luxury-container">
          <ProductReviewsClient product={product} />
        </div>
      </section>

      {related.length ? (
        <section className="bg-white py-10 md:py-12">
          <div className="luxury-container">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                Related
              </p>
              <h2 className="mt-2 font-serif text-3xl text-brand-green sm:text-4xl">
                Complete the edit.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/62">
                Pieces selected from the same category or styling context.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
