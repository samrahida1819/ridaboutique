"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getApprovedProductReviews,
  saveAdminReview,
  useProductRating
} from "@/lib/admin-store";
import { cn, formatDate } from "@/lib/utils";
import type { Product } from "@/types/commerce";

type ReviewForm = {
  name: string;
  rating: number;
  text: string;
};

const initialForm: ReviewForm = {
  name: "",
  rating: 5,
  text: ""
};

export function ProductReviewsClient({ product }: { product: Product }) {
  const { toast } = useToast();
  const rating = useProductRating(product);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ReviewForm, string>>>({});
  const approvedReviews = useMemo(
    () => getApprovedProductReviews(product),
    [product, version]
  );

  useEffect(() => {
    function refresh() {
      setVersion((current) => current + 1);
    }

    window.addEventListener("storage", refresh);
    window.addEventListener("rida-admin-storage", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("rida-admin-storage", refresh);
    };
  }, []);

  function update<K extends keyof ReviewForm>(key: K, value: ReviewForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof ReviewForm, string>> = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Name is required.";
    }

    if (form.rating < 1 || form.rating > 5) {
      nextErrors.rating = "Choose a rating.";
    }

    if (form.text.trim().length < 15) {
      nextErrors.text = "Write at least 15 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      toast({
        kind: "info",
        title: "Review needs a little more detail",
        description: "Please check the highlighted fields."
      });
      return;
    }

    saveAdminReview({
      id: `REV-${Date.now()}`,
      product: product.name,
      productId: product.id,
      customer: form.name.trim(),
      rating: form.rating,
      text: form.text.trim(),
      status: "Pending",
      date: new Date().toISOString().slice(0, 10)
    });

    setForm(initialForm);
    toast({
      title: "Review sent for approval",
      description: "Admin can approve it from the Reviews panel."
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              Reviews
            </p>
            <h2 className="mt-2 font-serif text-3xl text-brand-green sm:text-4xl">
              {rating.rating.toFixed(1)} from {rating.count} review{rating.count === 1 ? "" : "s"}.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/62">
              Customers can write a review here. Admin approves it before it becomes public.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-green ring-1 ring-brand-green/10">
            <ShieldCheck className="size-4 text-brand-gold" />
            Moderated
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {approvedReviews.length ? (
            approvedReviews.map((review) => (
              <article
                className="rounded-2xl border border-brand-green/10 bg-white p-5 shadow-[0_1px_0_rgba(6,40,31,0.08)]"
                key={review.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-green">{review.customer}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-green/50">
                      {formatDate(review.date)}
                    </p>
                  </div>
                  <div className="flex gap-0.5 text-brand-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        className={cn("size-4", index < review.rating && "fill-current")}
                        key={`${review.id}-${index}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-brand-charcoal/70">{review.text}</p>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-green/20 bg-white p-6 md:col-span-2">
              <CheckCircle2 className="size-7 text-brand-gold" />
              <p className="mt-3 font-serif text-2xl text-brand-green">No approved reviews yet.</p>
              <p className="mt-2 text-sm leading-6 text-brand-charcoal/60">
                Be the first to send feedback. It will show here after admin approval.
              </p>
            </div>
          )}
        </div>
      </div>

      <form
        className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-5"
        onSubmit={submitReview}
      >
        <p className="font-serif text-2xl text-brand-green">Write a review</p>
        <div className="mt-5 grid gap-4">
          <Field error={errors.name} label="Your Name">
            <Input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Name shown with review"
            />
          </Field>
          <Field error={errors.rating} label="Rating">
            <div className="grid gap-3">
              <Select
                value={String(form.rating)}
                onChange={(event) => update("rating", Number(event.target.value))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value === 1 ? "" : "s"}
                  </option>
                ))}
              </Select>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      aria-label={`${value} star rating`}
                      className="grid size-9 place-items-center rounded-full bg-brand-cream text-brand-gold transition hover:bg-brand-champagne"
                      key={value}
                      onClick={() => update("rating", value)}
                      type="button"
                    >
                      <Star className={cn("size-5", value <= form.rating && "fill-current")} />
                    </button>
                  );
                })}
              </div>
            </div>
          </Field>
          <Field error={errors.text} label="Review">
            <Textarea
              className="min-h-36"
              value={form.text}
              onChange={(event) => update("text", event.target.value)}
              placeholder="Share quality, fit, packaging, delivery, or custom experience."
            />
          </Field>
          <Button className="w-full" type="submit">
            Send Review
          </Button>
          <p className="text-xs leading-5 text-brand-charcoal/55">
            Review will enter the admin moderation queue before publishing.
          </p>
        </div>
      </form>
    </div>
  );
}
