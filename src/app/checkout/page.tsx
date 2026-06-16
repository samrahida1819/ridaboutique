import type { Metadata } from "next";
import { CheckoutClient } from "@/components/commerce/checkout-client";

export const metadata: Metadata = {
  title: "Buy now"
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
