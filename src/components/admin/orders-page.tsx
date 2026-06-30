"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, MapPin, Phone, RefreshCcw } from "lucide-react";
import { AdminNotice, orderStatuses, PageHeader, selectClassName } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const status = String(order.status || "Pending");
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [order.order_number, order.id, order.full_name, order.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, searchQuery, statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await adminFetch<{ orders: Array<Record<string, unknown>> }>("/api/admin/orders");
      setOrders(data.orders || []);
    } catch (nextError) {
      setOrders([]);
      setError(nextError instanceof Error ? nextError.message : "Orders load failed.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    setMessage("");

    try {
      await adminFetch(`/api/admin/orders/${orderId}`, { body: { status }, method: "PATCH" });
      setMessage("Order status updated.");
      await load();
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : "Order status update failed.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <>
      <PageHeader
        action={<Button onClick={() => void load()} variant="outline"><RefreshCcw className="size-4" />Refresh</Button>}
        description="View all orders, customer details, payment mode, and fulfillment status."
        title="Orders"
      />
      {error ? <AdminNotice message={error} /> : null}
      {message ? <AdminNotice message={message} /> : null}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          className="max-w-md"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by order number, customer, or phone"
          value={searchQuery}
        />
        <select className={selectClassName} onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
          <option value="all">All statuses</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4">
        {loading ? <AdminNotice message="Loading orders..." /> : null}
        {filteredOrders.map((order) => {
          const address = [order.address, order.city, order.state, order.pincode].filter(Boolean).join(", ");
          const orderItems = Array.isArray(order.order_items) ? (order.order_items as Array<Record<string, unknown>>) : [];

          return (
          <article className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" key={String(order.id)}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold">{String(order.order_number || order.id)}</p>
                <p className="mt-1 text-sm text-stone-500">{order.created_at ? formatDate(String(order.created_at)) : ""}</p>
                <div className="mt-3 grid gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <span className="flex items-center gap-2"><Phone className="size-4" />{String(order.full_name || "-")} - {String(order.phone || "-")}</span>
                  <span className="flex items-center gap-2"><Mail className="size-4" />{String(order.email || "-")}</span>
                  <span className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{address || "-"}</span>
                </div>
              </div>
              <div className="grid gap-2 sm:min-w-56">
                <select
                  className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                  disabled={updatingId === String(order.id)}
                  value={String(order.status || "Pending")}
                  onChange={(event) => void updateStatus(String(order.id), event.target.value)}
                >
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <div className="rounded-md bg-stone-100 p-3 text-sm dark:bg-neutral-950">
                  <div className="flex justify-between gap-4"><span>Payment</span><span className="font-medium uppercase">{String(order.payment_method || "cod")}</span></div>
                  <div className="mt-1 flex justify-between gap-4"><span>Status</span><span className="font-medium capitalize">{String(order.payment_status || "pending")}</span></div>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-2 border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-neutral-800 dark:text-stone-300">
              {orderItems.length ? orderItems.map((item) => (
                <div className="flex justify-between gap-3" key={String(item.id || item.product_name)}>
                  <span>{String(item.product_name || "Product")} x {String(item.quantity || 1)}</span>
                  <span>{formatCurrency(Number(item.total || Number(item.unit_price || 0) * Number(item.quantity || 1)))}</span>
                </div>
              )) : <span>No order items.</span>}
            </div>
            <div className="mt-4 grid gap-1 border-t border-stone-200 pt-4 text-sm dark:border-neutral-800 sm:ml-auto sm:max-w-xs">
              <div className="flex justify-between gap-4"><span className="text-stone-500">Subtotal</span><span>{formatCurrency(Number(order.subtotal || 0))}</span></div>
              <div className="flex justify-between gap-4"><span className="text-stone-500">Delivery</span><span>{formatCurrency(Number(order.delivery_charges || 0))}</span></div>
              <div className="flex justify-between gap-4 text-base font-semibold"><span>Total</span><span>{formatCurrency(Number(order.total || 0))}</span></div>
            </div>
          </article>
          );
        })}
        {!loading && !filteredOrders.length ? (
          <AdminNotice message={orders.length ? "No orders match your filters." : "No orders yet."} />
        ) : null}
      </div>
    </>
  );
}
