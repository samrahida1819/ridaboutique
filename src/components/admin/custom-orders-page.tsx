"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Save, Trash2 } from "lucide-react";
import { AdminNotice, PageHeader, selectClassName } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

type CustomOrderRow = {
  id: string;
  reference: string;
  full_name: string;
  phone: string;
  email?: string | null;
  product_type: string;
  quantity: number;
  description: string;
  reference_links?: string | null;
  reference_image_url?: string | null;
  budget?: string | null;
  delivery_date?: string | null;
  delivery_area?: string | null;
  notes?: string | null;
  status: string;
  quoted_price?: number | null;
  admin_note?: string | null;
  created_at?: string | null;
};

const statuses = ["Pending", "Approved", "Rejected", "Converted"];

type Draft = { status: string; quotedPrice: string; adminNote: string };

export function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ customOrders: CustomOrderRow[] }>("/api/admin/custom-orders");
      setOrders(data.customOrders || []);
      setMessage("");
    } catch (error) {
      setOrders([]);
      setMessage(error instanceof Error ? error.message : "Custom orders load failed.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => orders.filter((order) => statusFilter === "all" || order.status === statusFilter),
    [orders, statusFilter]
  );

  function draftFor(order: CustomOrderRow): Draft {
    return (
      drafts[order.id] || {
        status: order.status,
        quotedPrice: order.quoted_price != null ? String(order.quoted_price) : "",
        adminNote: order.admin_note || ""
      }
    );
  }

  function updateDraft(id: string, field: keyof Draft, value: string) {
    setDrafts((current) => {
      const base = current[id] || {
        status: orders.find((order) => order.id === id)?.status || "Pending",
        quotedPrice: "",
        adminNote: ""
      };
      return { ...current, [id]: { ...base, [field]: value } };
    });
  }

  async function save(order: CustomOrderRow) {
    const draft = draftFor(order);
    try {
      await adminFetch(`/api/admin/custom-orders/${order.id}`, {
        body: {
          status: draft.status,
          quotedPrice: draft.quotedPrice === "" ? null : Number(draft.quotedPrice),
          adminNote: draft.adminNote
        },
        method: "PATCH"
      });
      setMessage(`Saved ${order.reference}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Custom order update failed.");
    }
  }

  async function remove(order: CustomOrderRow) {
    if (!window.confirm(`Delete custom order ${order.reference}?`)) return;
    try {
      await adminFetch(`/api/admin/custom-orders/${order.id}`, { method: "DELETE" });
      setMessage(`Deleted ${order.reference}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Custom order delete failed.");
    }
  }

  return (
    <>
      <PageHeader
        action={<Button onClick={() => void load()} variant="outline"><RefreshCcw className="size-4" />Refresh</Button>}
        description="Review custom order requests, set quoted price, and update status."
        title="Custom Orders"
      />
      {message ? <AdminNotice message={message} /> : null}
      <div className="mb-5">
        <select className={selectClassName} onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4">
        {loading ? <AdminNotice message="Loading custom orders..." /> : null}
        {filtered.map((order) => {
          const draft = draftFor(order);
          return (
            <article className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" key={order.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold">{order.reference} - {order.product_type}</p>
                  <p className="mt-1 text-sm text-stone-500">{order.full_name} - {order.phone}{order.email ? ` - ${order.email}` : ""}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Qty: {order.quantity}
                    {order.budget ? ` - Budget: ${order.budget}` : ""}
                    {order.delivery_area ? ` - Area: ${order.delivery_area}` : ""}
                    {order.delivery_date ? ` - For: ${formatDate(order.delivery_date)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">{order.created_at ? formatDate(order.created_at) : ""}</p>
                </div>
                <span className="h-fit rounded-full border border-stone-200 px-3 py-1 text-xs dark:border-neutral-700">{order.status}</span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-stone-600 dark:text-stone-300">{order.description}</p>
              {order.reference_links ? <p className="mt-2 text-xs text-stone-500">Links: {order.reference_links}</p> : null}
              {order.reference_image_url ? (
                <a className="mt-2 inline-block text-xs text-blue-600 underline" href={order.reference_image_url} rel="noreferrer" target="_blank">
                  View reference image
                </a>
              ) : null}
              {order.notes ? <p className="mt-2 text-xs text-stone-500">Notes: {order.notes}</p> : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="Status">
                  <select className={`${selectClassName} w-full`} onChange={(event) => updateDraft(order.id, "status", event.target.value)} value={draft.status}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Quoted price">
                  <Input
                    inputMode="decimal"
                    onChange={(event) => updateDraft(order.id, "quotedPrice", event.target.value)}
                    placeholder="0"
                    value={draft.quotedPrice}
                  />
                </Field>
                <div className="flex items-end">
                  <span className="text-sm text-stone-500">
                    {draft.quotedPrice ? formatCurrency(Number(draft.quotedPrice) || 0) : "No quote yet"}
                  </span>
                </div>
              </div>
              <Field label="Admin note">
                <Textarea onChange={(event) => updateDraft(order.id, "adminNote", event.target.value)} value={draft.adminNote} />
              </Field>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => void save(order)} size="sm"><Save className="size-3" />Save</Button>
                <Button onClick={() => void remove(order)} size="sm" variant="outline"><Trash2 className="size-3" />Delete</Button>
              </div>
            </article>
          );
        })}
        {!loading && !filtered.length ? (
          <AdminNotice message={orders.length ? "No custom orders match this filter." : "No custom order requests yet."} />
        ) : null}
      </div>
    </>
  );
}
