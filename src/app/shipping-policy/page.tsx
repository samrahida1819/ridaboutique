import type { Metadata } from "next";
import { ContentPage } from "@/components/commerce/content-page";

export const metadata: Metadata = {
  title: "Shipping Policy"
};

export default function ShippingPolicyPage() {
  return <ContentPage contentKey="shipping" />;
}
