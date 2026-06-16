"use client";

import { useEffect, useState } from "react";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types/commerce";

export function OrdersClient() {
  const { authReady, isAuthenticated, user } = useAuth();
  const { orders: localOrders } = useShop();
  const [orders, setOrders] = useState<Order[]>(localOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!user || !hasSupabaseConfig()) {
        setOrders(localOrders);
        setLoading(false);
        return;
      }

      const { data } = await getSupabaseBrowserClient()
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (active && data) {
        setOrders(
          data.map((order) => ({
            id: order.order_number || order.id,
            date: order.created_at,
            total: Number(order.total || 0),
            status: order.status,
            customerName: order.full_name,
            email: order.email,
            phone: order.phone,
            address: order.address,
            city: order.city,
            state: order.state,
            pincode: order.pincode,
            paymentMethod: order.payment_method,
            items: (order.order_items || []).map((item: Record<string, unknown>) => ({
              productId: String(item.product_id || ""),
              name: String(item.product_name || "Product"),
              quantity: Number(item.quantity || 1),
              price: Number(item.unit_price || 0)
            }))
          }))
        );
      }

      if (active) {
        setLoading(false);
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [localOrders, user]);

  if (!authReady) {
    return <div className="app-container pb-12 pt-32 md:pt-40">Loading orders...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <LoginRequired description="Sign in to view your order history and track order status." title="Orders" />
      </div>
    );
  }

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Track your order status from pending to delivered.</p>

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-lg bg-stone-100 dark:bg-neutral-900" />
      ) : orders.length ? (
        <div className="mt-8 grid gap-4">
          {orders.map((order) => (
            <article className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950" key={order.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{order.id}</p>
                  <p className="mt-1 text-sm text-stone-500">{formatDate(order.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md border border-stone-200 px-3 py-1 text-sm dark:border-neutral-800">{order.status}</span>
                  <span className="font-semibold">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-stone-600 dark:text-stone-300">
                {order.items.map((item) => (
                  <div className="flex justify-between gap-3" key={`${order.id}-${item.name}`}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>{item.price ? formatCurrency(item.price * item.quantity) : ""}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-stone-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Placed orders will show here.</p>
        </div>
      )}
    </section>
  );
}
