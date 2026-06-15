"use client";

import { PackageCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { AuthLoading, LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency, formatDate } from "@/lib/utils";

const orderSteps = ["Confirmed", "Preparing", "Dispatched", "Delivered"];

export function OrdersClient() {
  const { authReady, isAuthenticated } = useAuth();
  const { orders } = useShop();
  const { toast } = useToast();

  if (!authReady) {
    return <AuthLoading title="Checking your orders" />;
  }

  if (!isAuthenticated) {
    return (
      <LoginRequired
        description="Sign in to view order history, tracking IDs, delivery status, and order support."
        title="Sign in to view your orders"
      />
    );
  }

  return (
    <div className="grid gap-5">
      {orders.length ? (
        orders.map((order) => (
          <article className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:rounded-[1.75rem] sm:p-6" key={order.id}>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <Badge>{order.status}</Badge>
                <h2 className="mt-3 font-serif text-3xl text-brand-green sm:mt-4 sm:text-4xl">{order.id}</h2>
                <p className="mt-2 text-sm text-brand-charcoal/60">
                  Placed {formatDate(order.date)} | {formatCurrency(order.total)}
                </p>
              </div>
              <Button
                onClick={() =>
                  toast({
                    kind: "info",
                    title: "Tracking refreshed",
                    description: `${order.trackingId} is linked to courier partner delivery.`
                  })
                }
                variant="secondary"
              >
                <Truck className="size-4" />
                Track Order
              </Button>
            </div>
            <div className="mt-6 grid gap-3">
              {order.items.map((item) => (
                <div className="flex items-center justify-between rounded-2xl bg-brand-cream px-4 py-3 text-sm" key={item.name}>
                  <span className="text-brand-charcoal/70">{item.name}</span>
                  <span className="font-semibold text-brand-green">Qty {item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4">
              {orderSteps.map((step) => {
                const currentStatus = order.status === "Return requested" ? "Delivered" : order.status;
                const active = orderSteps.indexOf(step) <= orderSteps.indexOf(currentStatus);

                return (
                  <div className={active ? "rounded-2xl bg-brand-green p-4 text-brand-ivory" : "rounded-2xl bg-brand-cream p-4 text-brand-green/45"} key={step}>
                    <PackageCheck className="size-4 text-brand-gold" />
                    <p className="mt-3 text-sm font-semibold">{step}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-green/20 bg-white p-8 text-center shadow-luxury sm:rounded-[1.75rem] sm:p-12">
          <PackageCheck className="mx-auto size-10 text-brand-gold" />
          <h2 className="mt-5 font-serif text-3xl text-brand-green sm:text-5xl">No orders yet</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-charcoal/60">
            Orders placed from checkout will appear here with tracking and support actions.
          </p>
          <ButtonLink className="mt-8" href="/shop">
            Start Shopping
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
