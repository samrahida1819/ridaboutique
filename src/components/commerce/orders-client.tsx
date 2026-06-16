"use client";

import { useEffect, useState } from "react";
import { PackageCheck, ShoppingBag } from "lucide-react";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { ButtonLink } from "@/components/ui/button";
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

      try {
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
      } catch {
        if (active) {
          setOrders(localOrders);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [localOrders, user]);

  if (!authReady) {
    return <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">Loading orders...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">
        <LoginRequired description="Sign in to view your order history and track order status." title="Orders" />
      </div>
    );
  }

  return (
    <section className="app-container bg-brand-ivory pb-12 pt-28 sm:pt-32 md:pt-40">
      <div className="rounded-xl bg-brand-green p-4 text-brand-ivory shadow-luxury sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">Order history</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">Orders</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-ivory/72">
          Track your order status from pending to delivered.
        </p>
      </div>

      {loading ? (
        <div className="mt-5 h-40 animate-pulse rounded-xl bg-white shadow-luxury" />
      ) : orders.length ? (
        <div className="mt-5 grid gap-3">
          {orders.map((order) => (
            <article className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-[0_1px_0_rgba(6,40,31,0.08)] sm:p-5" key={order.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-brand-green">{order.id}</p>
                  <p className="mt-1 text-sm text-brand-charcoal/55">{formatDate(order.date)}</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-brand-ivory">{order.status}</span>
                  <span className="font-bold text-brand-charcoal">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-brand-charcoal/65">
                {order.items.map((item) => (
                  <div className="flex justify-between gap-3 rounded-lg bg-brand-ivory px-3 py-2" key={`${order.id}-${item.name}`}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>{item.price ? formatCurrency(item.price * item.quantity) : ""}</span>
                  </div>
                ))}
              </div>
              {order.address ? (
                <p className="mt-4 text-xs leading-5 text-brand-charcoal/50">
                  Delivery: {order.address}{order.city ? `, ${order.city}` : ""}{order.pincode ? ` - ${order.pincode}` : ""}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-brand-green/10 bg-white p-6 text-center shadow-luxury sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-cream text-brand-green">
            <PackageCheck className="size-7" />
          </span>
          <p className="mt-4 font-serif text-3xl text-brand-green">No orders yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brand-charcoal/62">Placed orders will show here.</p>
          <ButtonLink className="mt-6 w-full sm:w-auto" href="/products">
            <ShoppingBag className="size-4" />
            Shop products
          </ButtonLink>
        </div>
      )}
    </section>
  );
}
