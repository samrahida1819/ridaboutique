import type { Metadata } from "next";
import { SectionHeading } from "@/components/commerce/section-heading";
import { ShopExplorer } from "@/components/commerce/shop-explorer";
import { products } from "@/data/store";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop women's fashion, custom earrings, hijabs, accessories, gifts, and made-to-order pieces from Rida Boutique."
};

export default async function ShopPage({
  searchParams
}: {
  searchParams?: Promise<{ query?: string; sort?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-20">
        <SectionHeading
          description="Use filters, search, and sorting to quickly find fashion, gifts, hijabs, accessories, and custom-ready products."
          eyebrow="Shop"
          title="Shop products."
        />
        <div className="mt-10">
          <ShopExplorer initialQuery={params?.query || params?.sort || ""} products={products} />
        </div>
      </section>
    </main>
  );
}
