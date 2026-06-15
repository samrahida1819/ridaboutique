import type { Metadata } from "next";
import { SectionHeading } from "@/components/commerce/section-heading";
import { WishlistClient } from "@/components/commerce/wishlist-client";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved products, move-to-cart actions, and stock notifications for Rida Boutique."
};

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-12 md:pb-20">
        <SectionHeading
          description="Save products, move them to cart, and request stock or back-in-stock alerts."
          eyebrow="Wishlist"
          title="Pieces saved for later."
        />
        <div className="mt-10">
          <WishlistClient />
        </div>
      </section>
    </main>
  );
}
