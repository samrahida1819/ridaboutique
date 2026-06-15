import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Control Panel",
  description: "Rida Boutique admin control panel for storefront controls, orders, products, inventory, custom orders, customers, coupons, reviews, returns, analytics, content, and settings."
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f0f0f1] pt-32 md:pt-36">
      <AdminDashboard />
    </main>
  );
}
