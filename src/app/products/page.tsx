import type { Metadata } from "next";
import { ProductListing } from "@/components/commerce/product-listing";

export const metadata: Metadata = {
  title: "Products"
};

export default function ProductsPage() {
  return <ProductListing />;
}
