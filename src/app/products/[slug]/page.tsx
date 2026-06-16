import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/commerce/product-detail-client";

export const metadata: Metadata = {
  title: "Product Details"
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
