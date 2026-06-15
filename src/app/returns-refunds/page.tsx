import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { SectionHeading } from "@/components/commerce/section-heading";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Return eligibility and refund support for Rida Boutique standard and custom products."
};

const eligible = ["Standard women's fashion", "Standard hijabs", "Accessories in unused condition"];
const ineligible = ["Custom earrings", "Custom frames", "Personalized gifts", "Cash bouquets"];

export default function ReturnsRefundsPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container pb-12 md:pb-20">
        <SectionHeading
          description="Clear eligibility rules, admin-reviewed requests, and support escalation for Kashmir deliveries."
          eyebrow="Returns & Refunds"
          title="A considered policy for every product type."
        />
        <div className="mt-6 grid gap-4 lg:mt-10 lg:grid-cols-2 lg:gap-6">
          <PolicyPanel icon={<CheckCircle2 className="size-6 text-brand-gold" />} items={eligible} title="Return eligible" />
          <PolicyPanel icon={<XCircle className="size-6 text-brand-gold" />} items={ineligible} title="Not return eligible" />
        </div>
        <div className="mt-6 rounded-2xl bg-brand-green p-4 text-brand-ivory shadow-luxury sm:mt-8 sm:rounded-[1.75rem] sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <AlertCircle className="mt-1 size-6 shrink-0 text-brand-gold" />
              <div>
                <p className="font-serif text-3xl">Refund requests are admin reviewed.</p>
                <p className="mt-2 text-sm leading-7 text-brand-ivory/70">
                  Standard products must be unused, with packaging intact. Custom products are made against
                  approved briefs and cannot be returned unless damaged or incorrectly fulfilled.
                </p>
              </div>
            </div>
            <ButtonLink className="shrink-0" href="/contact" variant="gold">
              Contact Support
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}

function PolicyPanel({
  title,
  items,
  icon
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:rounded-[1.75rem] sm:p-6">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="font-serif text-3xl text-brand-green sm:text-4xl">{title}</h2>
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div className="rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-charcoal/72" key={item}>
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}
