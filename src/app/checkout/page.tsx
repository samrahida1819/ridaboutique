import type { Metadata } from "next";
import { SectionHeading } from "@/components/commerce/section-heading";
import { CheckoutClient } from "@/components/commerce/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for Rida Boutique with UPI, cards, net banking, wallets, address management, coupons, and order summary."
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-12 md:pb-20">
        <SectionHeading
          description="Guest checkout or account checkout with Kashmir delivery details and Razorpay-ready payment creation."
          eyebrow="Checkout"
          title="A calm, secure final step."
        />
        <div className="mt-10">
          <CheckoutClient />
        </div>
      </section>
    </main>
  );
}
