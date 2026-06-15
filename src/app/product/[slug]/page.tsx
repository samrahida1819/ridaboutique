import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/commerce/product-detail-client";
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
    return {
      title: "Product"
    };
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
  const product = getProductBySlug(slug) || null;
  const related = product ? getRelatedProducts(product) : [];

  return (
    <ProductDetailClient
      fallbackProduct={product}
      fallbackRelated={related}
      slug={slug}
    />
  );
}
