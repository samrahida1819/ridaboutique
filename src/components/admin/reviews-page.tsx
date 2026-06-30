"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, RefreshCcw, Star, Trash2, X } from "lucide-react";
import { AdminNotice, PageHeader, selectClassName } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api-client";
import { cn, formatDate } from "@/lib/utils";

type ReviewRow = {
  id: string;
  product_id?: string | null;
  product_name?: string | null;
  customer: string;
  rating: number;
  body: string;
  status: string;
  created_at?: string | null;
};

const statuses = ["Pending", "Approved", "Rejected"];

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ reviews: ReviewRow[] }>("/api/admin/reviews");
      setReviews(data.reviews || []);
      setMessage("");
    } catch (error) {
      setReviews([]);
      setMessage(error instanceof Error ? error.message : "Reviews load failed.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => reviews.filter((review) => statusFilter === "all" || review.status === statusFilter),
    [reviews, statusFilter]
  );

  async function setStatus(review: ReviewRow, status: string) {
    try {
      await adminFetch(`/api/admin/reviews/${review.id}`, { body: { status }, method: "PATCH" });
      setMessage(`Review ${status.toLowerCase()}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review update failed.");
    }
  }

  async function remove(review: ReviewRow) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await adminFetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
      setMessage("Review deleted.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review delete failed.");
    }
  }

  return (
    <>
      <PageHeader
        action={<Button onClick={() => void load()} variant="outline"><RefreshCcw className="size-4" />Refresh</Button>}
        description="Approve or reject customer reviews before they appear on product pages."
        title="Reviews"
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
        {loading ? <AdminNotice message="Loading reviews..." /> : null}
        {filtered.map((review) => (
          <article className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" key={review.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold">{review.product_name || "Product"}</p>
                <p className="mt-1 text-sm text-stone-500">{review.customer}{review.created_at ? ` - ${formatDate(review.created_at)}` : ""}</p>
                <div className="mt-1 flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className={cn("size-4", index < review.rating && "fill-current")} key={index} />
                  ))}
                </div>
              </div>
              <span className="h-fit rounded-full border border-stone-200 px-3 py-1 text-xs dark:border-neutral-700">{review.status}</span>
            </div>
            <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">{review.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {review.status !== "Approved" ? (
                <Button onClick={() => void setStatus(review, "Approved")} size="sm"><Check className="size-3" />Approve</Button>
              ) : null}
              {review.status !== "Rejected" ? (
                <Button onClick={() => void setStatus(review, "Rejected")} size="sm" variant="outline"><X className="size-3" />Reject</Button>
              ) : null}
              <Button onClick={() => void remove(review)} size="sm" variant="outline"><Trash2 className="size-3" />Delete</Button>
            </div>
          </article>
        ))}
        {!loading && !filtered.length ? (
          <AdminNotice message={reviews.length ? "No reviews match this filter." : "No reviews yet."} />
        ) : null}
      </div>
    </>
  );
}
