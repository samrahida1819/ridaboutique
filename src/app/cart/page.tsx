import type { Metadata } from "next";
import { SectionHeading } from "@/components/commerce/section-heading";
import { CartClient } from "@/components/commerce/cart-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Rida Boutique cart before checkout."
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-12 md:pb-20">
        <SectionHeading
          description="Review pieces, adjust quantities, and continue to a secure Razorpay-ready checkout."
          eyebrow="Cart"
          title="Your selected edit."
        />
        <div className="mt-10">
          <CartClient />
        </div>
      </section>
    </main>
  );
}
