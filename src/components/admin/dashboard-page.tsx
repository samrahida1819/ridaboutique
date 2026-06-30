"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  ImageIcon,
  PackageSearch,
  Plus,
  RefreshCcw,
  Sparkles,
  Star,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { AdminNotice, PageHeader } from "@/components/admin/shared";
import { Button, ButtonLink } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api-client";
import { hasSupabaseConfig } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

type Metrics = {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingCustomOrders: number;
  pendingReviews: number;
};

const emptyMetrics: Metrics = {
  totalOrders: 0,
  pendingOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  totalRevenue: 0,
  pendingCustomOrders: 0,
  pendingReviews: 0
};

export function AdminDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [lowStockProducts, setLowStockProducts] = useState<Array<Record<string, unknown>>>([]);
  const [recentCustomers, setRecentCustomers] = useState<Array<Record<string, unknown>>>([]);
  const [recentOrders, setRecentOrders] = useState<Array<Record<string, unknown>>>([]);
  const [recentCustomOrders, setRecentCustomOrders] = useState<Array<Record<string, unknown>>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetch<{
        metrics: Metrics;
        lowStockProducts: Array<Record<string, unknown>>;
        recentCustomers: Array<Record<string, unknown>>;
        recentOrders: Array<Record<string, unknown>>;
        recentCustomOrders: Array<Record<string, unknown>>;
      }>("/api/admin/dashboard");
      setMetrics({ ...emptyMetrics, ...data.metrics });
      setLowStockProducts(data.lowStockProducts || []);
      setRecentCustomers(data.recentCustomers || []);
      setRecentOrders(data.recentOrders || []);
      setRecentCustomOrders(data.recentCustomOrders || []);
    } catch (nextError) {
      setLowStockProducts([]);
      setRecentCustomers([]);
      setRecentOrders([]);
      setRecentCustomOrders([]);
      setError(nextError instanceof Error ? nextError.message : "Dashboard load failed.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards: Array<{ label: string; value: string; href: string }> = [
    { label: "Total Orders", value: metrics.totalOrders.toString(), href: "/admin/orders" },
    { label: "Pending Orders", value: metrics.pendingOrders.toString(), href: "/admin/orders" },
    { label: "Total Products", value: metrics.totalProducts.toString(), href: "/admin/products" },
    { label: "Total Customers", value: metrics.totalCustomers.toString(), href: "/admin/customers" },
    { label: "Total Revenue", value: formatCurrency(metrics.totalRevenue), href: "/admin/orders" }
  ];

  const attention = [
    {
      label: "New custom order requests",
      count: metrics.pendingCustomOrders,
      href: "/admin/custom-orders",
      icon: Sparkles,
      cta: "Review requests"
    },
    {
      label: "Reviews waiting for approval",
      count: metrics.pendingReviews,
      href: "/admin/reviews",
      icon: Star,
      cta: "Moderate reviews"
    },
    {
      label: "Orders to process",
      count: metrics.pendingOrders,
      href: "/admin/orders",
      icon: PackageSearch,
      cta: "Open orders"
    }
  ];

  return (
    <>
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/" rel="noreferrer" target="_blank" variant="outline">
              <ExternalLink className="size-4" />View store
            </ButtonLink>
            <Button onClick={() => void load()} variant="outline"><RefreshCcw className="size-4" />Refresh</Button>
          </div>
        }
        description="Live store overview and the actions that need you today."
        title="Dashboard"
      />
      {!hasSupabaseConfig() ? <AdminNotice message="Supabase env is missing. Add env vars before using live admin data." /> : null}
      {error ? <AdminNotice message={error} /> : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <ButtonLink href="/admin/products/new" size="sm"><Plus className="size-4" />Add product</ButtonLink>
        <ButtonLink href="/admin/banners" size="sm" variant="secondary"><ImageIcon className="size-4" />Banners</ButtonLink>
        <ButtonLink href="/admin/orders" size="sm" variant="secondary"><PackageSearch className="size-4" />Orders</ButtonLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Link
            className="group rounded-lg border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            href={card.href}
            key={card.label}
          >
            <p className="flex items-center justify-between text-sm text-stone-500">
              {card.label}
              <ArrowRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
            </p>
            <p className="mt-2 text-2xl font-semibold">{loading ? "..." : card.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Needs attention</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {attention.map((item) => {
            const Icon = item.icon;
            const urgent = item.count > 0;
            return (
              <Link
                className={`rounded-lg border p-4 transition hover:shadow-sm ${
                  urgent
                    ? "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
                    : "border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                }`}
                href={item.href}
                key={item.label}
              >
                <div className="flex items-center justify-between">
                  <span className={`grid size-9 place-items-center rounded-full ${urgent ? "bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100" : "bg-stone-100 text-stone-500 dark:bg-neutral-800"}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className="text-3xl font-semibold">{loading ? "..." : item.count}</span>
                </div>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-stone-500">
                  {item.cta} <ArrowRight className="size-3" />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 p-4 dark:border-neutral-800">
            <h2 className="font-semibold">Recent Orders</h2>
            <ButtonLink href="/admin/orders" size="sm" variant="secondary">View all</ButtonLink>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-stone-500">
                <tr>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length ? recentOrders.map((order) => (
                  <tr className="border-t border-stone-200 dark:border-neutral-800" key={String(order.order_number || order.created_at)}>
                    <td className="p-4">{String(order.order_number || "-")}</td>
                    <td className="p-4">{String(order.full_name || "-")}</td>
                    <td className="p-4">{String(order.status || "-")}</td>
                    <td className="p-4">{formatCurrency(Number(order.total || 0))}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="p-8 text-center text-stone-500" colSpan={4}>{loading ? "Loading..." : "No recent orders."}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <h2 className="font-semibold">Recent Custom Orders</h2>
            </div>
            <ButtonLink href="/admin/custom-orders" size="sm" variant="secondary">View all</ButtonLink>
          </div>
          <div className="divide-y divide-stone-200 dark:divide-neutral-800">
            {recentCustomOrders.length ? recentCustomOrders.map((order) => (
              <div className="flex items-center justify-between gap-3 p-4 text-sm" key={String(order.reference)}>
                <div className="min-w-0">
                  <p className="truncate font-medium">{String(order.full_name || "Customer")} - {String(order.product_type || "Custom")}</p>
                  <p className="text-xs text-stone-500">{String(order.reference)}{order.created_at ? ` - ${formatDate(String(order.created_at))}` : ""}</p>
                </div>
                <span className="shrink-0 rounded-full border border-stone-200 px-2 py-1 text-xs dark:border-neutral-700">{String(order.status || "Pending")}</span>
              </div>
            )) : (
              <p className="p-6 text-sm text-stone-500">{loading ? "Loading..." : "No custom order requests yet."}</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <PackageSearch className="size-4" />
              <h2 className="font-semibold">Low Stock</h2>
            </div>
            <ButtonLink href="/admin/products" size="sm" variant="secondary">Products</ButtonLink>
          </div>
          <div className="divide-y divide-stone-200 dark:divide-neutral-800">
            {lowStockProducts.length ? lowStockProducts.map((product) => (
              <div className="flex items-center justify-between gap-3 p-4 text-sm" key={String(product.id)}>
                <div>
                  <p className="font-medium">{String(product.name || "Untitled product")}</p>
                  <p className="text-xs text-stone-500">{String(product.slug || "")}</p>
                </div>
                <span className="rounded-full border border-stone-200 px-2 py-1 text-xs dark:border-neutral-700">
                  {Number(product.stock || 0)} left
                </span>
              </div>
            )) : (
              <p className="p-6 text-sm text-stone-500">No low-stock products.</p>
            )}
          </div>
        </section>
        <section className="rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <UserRound className="size-4" />
              <h2 className="font-semibold">Recent Customers</h2>
            </div>
            <ButtonLink href="/admin/customers" size="sm" variant="secondary">Customers</ButtonLink>
          </div>
          <div className="divide-y divide-stone-200 dark:divide-neutral-800">
            {recentCustomers.length ? recentCustomers.map((customer) => (
              <div className="flex items-center justify-between gap-3 p-4 text-sm" key={String(customer.id)}>
                <div>
                  <p className="font-medium">{String(customer.full_name || customer.email || "Customer")}</p>
                  <p className="text-xs text-stone-500">{String(customer.email || "")}</p>
                </div>
                <span className="rounded-full border border-stone-200 px-2 py-1 text-xs capitalize dark:border-neutral-700">
                  {String(customer.role || "customer")}
                </span>
              </div>
            )) : (
              <p className="p-6 text-sm text-stone-500">No recent customers.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
