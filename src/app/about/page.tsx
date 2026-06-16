import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  HeartHandshake,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { SectionHeading } from "@/components/commerce/section-heading";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us"
};

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=86`;

const promises = [
  {
    title: "Clear pricing",
    text: "Products show direct prices, and custom requests are confirmed before you checkout.",
    icon: CheckCircle2
  },
  {
    title: "Boutique finish",
    text: "Every order is packed with care, from occasion outfits to personalized gifts.",
    icon: PackageCheck
  },
  {
    title: "Human support",
    text: "Questions, custom briefs, and delivery updates stay simple through email and WhatsApp.",
    icon: MessageCircle
  }
];

const lanes = [
  "Women's fashion",
  "Hijabs",
  "Custom earrings",
  "Cash bouquets",
  "Personalized frames",
  "Curated gift boxes"
];

const customSteps = [
  ["Share your brief", "Send reference images, occasion date, budget, and required personal details."],
  ["Approve the plan", "We confirm product options, price, delivery timing, and any design limits."],
  ["Checkout safely", "Once approved, you can place the order through the website with COD support."]
];

export default function AboutPage() {
  return (
    <main className="bg-brand-ivory text-brand-green">
      <section className="bg-brand-green pb-10 pt-32 text-brand-ivory md:pb-14 md:pt-40">
        <div className="luxury-container grid gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-gold">
              About Rida Boutique
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-none sm:text-5xl md:text-7xl">
              Boutique shopping that feels personal, polished, and easy.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-ivory/75 sm:text-base">
              Rida Boutique is built for customers who want elegant fashion and thoughtful custom
              gifts without confusing chats, hidden pricing, or messy order tracking.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" size="lg" variant="gold">
                Shop the edit <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/custom-orders" size="lg" variant="secondary">
                Start custom order
              </ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-brand-gold/25 bg-white/10 shadow-luxury">
            <Image
              alt="Premium boutique packaging and gifting details"
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 430px, 100vw"
              src={image("photo-1512909006721-3d6018887383")}
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-brand-green/90 p-4 text-brand-ivory">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                Ready pieces and custom work
              </p>
              <p className="mt-2 text-sm leading-6 text-brand-ivory/78">
                One store for outfits, hijabs, accessories, and occasion gifting.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="luxury-container grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            description="The website is designed around the way customers actually buy: browse what is ready, save what you love, ask for custom pieces when needed, and track every order from one account."
            eyebrow="Our story"
            title="Rida Boutique brings boutique service into a clear online flow."
          />
          <div className="rounded-2xl border border-brand-green/10 bg-white p-5 shadow-luxury md:p-7">
            <p className="text-sm leading-7 text-brand-charcoal/70">
              We focus on pieces that feel special without making shopping slow. Ready products
              can be added to cart immediately. Custom gifts and accessories follow a simple
              approval process, so you know the price, timeline, and final direction before the
              order moves ahead.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {lanes.map((lane) => (
                <Link
                  className="flex items-center justify-between rounded-xl border border-brand-green/10 bg-brand-cream px-4 py-3 text-sm font-semibold transition hover:border-brand-gold hover:bg-white"
                  href={`/products?query=${encodeURIComponent(lane)}`}
                  key={lane}
                >
                  {lane}
                  <ArrowRight className="size-4 text-brand-gold" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="luxury-container">
          <SectionHeading
            description="Good ecommerce is not only about products. It is about confidence before and after checkout."
            eyebrow="Customer promise"
            title="What customers should feel every time."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {promises.map((promise) => {
              const Icon = promise.icon;
              return (
                <div
                  className="rounded-2xl border border-brand-green/10 bg-brand-ivory p-5 shadow-[0_1px_0_rgba(6,40,31,0.08)]"
                  key={promise.title}
                >
                  <Icon className="size-6 text-brand-gold" />
                  <h2 className="mt-5 font-serif text-2xl text-brand-green">{promise.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-brand-charcoal/65">{promise.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="luxury-container grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-brand-cream">
            <Image
              alt="Boutique fashion and custom gifting mood"
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              src={image("photo-1525507119028-ed4c629a60a3")}
            />
          </div>
          <div className="rounded-2xl bg-brand-green p-5 text-brand-ivory shadow-luxury md:p-7">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              <Sparkles className="size-4" />
              Custom orders
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
              Made-to-brief gifts should still feel organized.
            </h2>
            <div className="mt-6 grid gap-3">
              {customSteps.map(([title, text], index) => (
                <div
                  className="grid gap-3 rounded-2xl border border-brand-gold/25 p-4 sm:grid-cols-[44px_1fr]"
                  key={title}
                >
                  <span className="grid size-10 place-items-center rounded-full bg-brand-gold text-sm font-bold text-brand-green">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-brand-ivory/68">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <ButtonLink className="mt-6" href="/custom-orders" variant="gold">
              Request a custom piece <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="luxury-container grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, "Secure accounts", "Email login keeps wishlist, checkout, and order history connected."],
            [Gift, "Gift-ready details", "Packaging, notes, and presentation are treated as part of the product."],
            [HeartHandshake, "After-order support", "Orders, questions, and delivery concerns stay easy to follow."]
          ].map(([Icon, title, text]) => {
            const CardIcon = Icon as typeof ShieldCheck;
            return (
              <div
                className="rounded-2xl border border-brand-green/10 bg-brand-ivory p-5 text-brand-green"
                key={String(title)}
              >
                <CardIcon className="size-6 text-brand-gold" />
                <h2 className="mt-4 font-serif text-2xl">{String(title)}</h2>
                <p className="mt-2 text-sm leading-6 text-brand-charcoal/65">{String(text)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="luxury-container rounded-2xl bg-brand-green p-5 text-brand-ivory shadow-luxury md:p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                Shop Rida Boutique
              </p>
              <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
                Find something ready, or let us create something for your occasion.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <ButtonLink href="/products" variant="gold">
                Browse products
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
