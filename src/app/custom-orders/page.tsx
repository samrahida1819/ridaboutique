import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock3, ImageIcon, IndianRupee, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/commerce/section-heading";
import { CustomOrderForm } from "@/components/forms/custom-order-form";

export const metadata: Metadata = {
  title: "Custom Orders",
  description: "Request made-to-order custom products from Rida Boutique. Share your idea first, then the team contacts you with the final price before payment."
};

const flow = [
  "Submit request",
  "Team contacts you",
  "Final price shared",
  "Pay after approval"
];

const prep = [
  "Reference image or link",
  "Delivery area in Kashmir",
  "Preferred delivery date",
  "Phone or WhatsApp for pricing"
];

const reviewNotes = [
  {
    title: "Response time",
    detail: "Most requests are reviewed within 24 hours.",
    icon: Clock3
  },
  {
    title: "Pricing",
    detail: "Final price is shared after your design, quantity, and references are reviewed.",
    icon: IndianRupee
  },
  {
    title: "Support",
    detail: "Use WhatsApp for urgent event orders or clarification.",
    icon: MessageCircle
  }
];

export default function CustomOrdersPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-28 md:pt-40">
      <section className="luxury-container pb-12 md:pb-20">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10">
          <div className="order-1 lg:order-2">
            <CustomOrderForm />
          </div>

          <aside className="order-2 space-y-5 lg:order-1 lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              description="Share your idea, references, contact details, and date. We review it first, contact you with the final price, then create checkout after approval."
              eyebrow="Request Custom Order"
              title="Custom pieces without guesswork."
            />

            <div className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                How it works
              </p>
              <div className="mt-4 grid gap-3">
                {flow.map((item, index) => (
                <div className="flex items-center gap-3" key={item}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-green text-xs font-semibold text-brand-gold">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-brand-green">{item}</p>
                  {index < flow.length - 1 ? <ArrowRight className="ml-auto size-4 text-brand-gold" /> : null}
                </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl bg-brand-green p-5 text-brand-ivory shadow-luxury">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                Keep ready
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {prep.map((item) => (
                  <p className="flex items-center gap-3 text-sm text-brand-ivory/78" key={item}>
                    <ImageIcon className="size-4 text-brand-gold" />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {reviewNotes.map((note) => {
                const Icon = note.icon;

                return (
                  <div className="rounded-2xl border border-brand-green/10 bg-white p-4" key={note.title}>
                    <Icon className="size-5 text-brand-gold" />
                    <p className="mt-3 text-sm font-bold text-brand-green">{note.title}</p>
                    <p className="mt-1 text-sm leading-6 text-brand-charcoal/60">{note.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-brand-gold/25 bg-white p-5 text-brand-green">
              <p className="flex items-start gap-3 text-sm leading-6">
                <CheckCircle2 className="size-5 text-brand-gold" />
                Custom earrings, frames, personalized gifts, and cash bouquets are not return eligible.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
