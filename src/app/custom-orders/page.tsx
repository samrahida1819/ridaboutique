import type { Metadata } from "next";
import { CheckCircle2, Gem, Gift, PackageCheck } from "lucide-react";
import { CustomOrderForm } from "@/components/forms/custom-order-form";

export const metadata: Metadata = {
  title: "Custom Orders"
};

const highlights = [
  "Custom earrings, frames, cash bouquets, hijabs, and gifts",
  "Final price shared after admin review",
  "References, budget, date, and notes supported"
];

export default function CustomOrdersPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pb-12 pt-32 md:pt-40">
      <section className="luxury-container">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <aside className="rounded-2xl bg-brand-green p-5 text-brand-ivory shadow-luxury md:p-7 lg:sticky lg:top-32">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              Custom Orders
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Tell us what to make.
            </h1>
            <p className="mt-4 text-sm leading-7 text-brand-ivory/72">
              Share your idea, reference images, budget, and delivery date. Rida Boutique will review
              the request and contact you with the final price before payment.
            </p>

            <div className="mt-6 grid gap-3">
              {highlights.map((item) => (
                <div className="flex gap-3 rounded-2xl border border-brand-gold/20 bg-white/8 p-4" key={item}>
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-gold" />
                  <p className="text-sm leading-6 text-brand-ivory/78">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [Gem, "Earrings"],
                [Gift, "Gifts"],
                [PackageCheck, "Bouquets"]
              ].map(([Icon, label]) => (
                <div
                  className="flex items-center gap-3 rounded-2xl bg-brand-gold px-4 py-3 text-sm font-bold text-brand-green"
                  key={String(label)}
                >
                  <Icon className="size-4" />
                  {String(label)}
                </div>
              ))}
            </div>
          </aside>

          <CustomOrderForm />
        </div>
      </section>
    </main>
  );
}
