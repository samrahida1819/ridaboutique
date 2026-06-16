import type { Metadata } from "next";
import { CartClient } from "@/components/commerce/cart-client";

export const metadata: Metadata = {
  title: "Cart"
};

export default function CartPage() {
  return <CartClient />;
}
