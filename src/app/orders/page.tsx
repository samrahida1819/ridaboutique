import type { Metadata } from "next";
import { SectionHeading } from "@/components/commerce/section-heading";
import { OrdersClient } from "@/components/commerce/orders-client";

export const metadata: Metadata = {
  title: "Orders",
  description: "Track Rida Boutique orders, delivery progress, and order history."
};

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-12 md:pb-20">
        <SectionHeading
          description="Courier partner tracking and order history for profile and support workflows."
          eyebrow="Orders"
          title="Track every boutique order."
        />
        <div className="mt-10">
          <OrdersClient />
        </div>
      </section>
    </main>
  );
}
