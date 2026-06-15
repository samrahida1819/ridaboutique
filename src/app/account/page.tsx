import type { Metadata } from "next";
import { SectionHeading } from "@/components/commerce/section-heading";
import { AccountClient } from "@/components/commerce/account-client";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage orders, saved delivery addresses, wishlist, notifications, returns, support, and account settings."
};

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-12 md:pb-20">
        <SectionHeading
          description="Manage your orders, saved delivery addresses, wishlist, returns, notifications, support, and account settings."
          eyebrow="Account"
          title="Your Account."
        />
        <div className="mt-10">
          <AccountClient />
        </div>
      </section>
    </main>
  );
}
