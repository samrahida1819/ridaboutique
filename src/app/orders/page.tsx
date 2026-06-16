import type { Metadata } from "next";
import { OrdersClient } from "@/components/commerce/orders-client";

export const metadata: Metadata = {
  title: "Orders"
};

export default function OrdersPage() {
  return <OrdersClient />;
}
