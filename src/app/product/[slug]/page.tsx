import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { ProductPurchasePanel } from "@/components/commerce/product-purchase-panel";
import { ProductReviewsClient } from "@/components/commerce/product-reviews-client";
import { SectionHeading } from "@/components/commerce/section-heading";
import { getProductBySlug, getRelatedProducts, products } from "@/data/store";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image]
    }
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product);

  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container grid gap-6 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 md:pb-20">
        <ProductGallery images={product.images} name={product.name} videoUrl={product.videoUrl} />
        <ProductPurchasePanel product={product} />
      </section>

      <section className="bg-white py-10 md:py-12">
        <div className="luxury-container grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          <SectionHeading
            description="A concise product dossier for confident checkout."
            eyebrow="Details"
            title="Designed with care, finished with restraint."
          />
          <div className="grid gap-4">
            {product.details.map((detail) => (
              <div className="rounded-2xl border border-brand-green/10 bg-brand-ivory p-5" key={detail}>
                <p className="text-sm text-brand-charcoal/72">{detail}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-brand-green/10 bg-brand-green p-5 text-brand-ivory">
              <p className="flex items-center gap-3 text-sm">
                <ShieldCheck className="size-5 text-brand-gold" />
                Reviews are accepted from customers and published after admin approval.
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
            <SectionHeading
              description="Pieces selected from the same category or styling context."
              eyebrow="Related"
              title="Complete the edit."
            />
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
