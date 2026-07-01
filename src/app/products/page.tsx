import type { Metadata } from "next";
import { ProductListing } from "@/components/commerce/product-listing";

export const metadata: Metadata = {
  title: "Products"
};

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;

  return <ProductListing initialQuery={query} />;
}
