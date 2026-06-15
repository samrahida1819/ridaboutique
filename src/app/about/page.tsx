import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  CalendarCheck,
  Gem,
  HeartHandshake,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { SectionHeading } from "@/components/commerce/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { heroImage } from "@/data/store";

export const metadata: Metadata = {
  title: "About",
  description:
    "Rida Boutique is a modern luxury boutique based in Kashmir for women's fashion, gifting, accessories, hijabs, and made-to-order custom pieces."
};

const promises = [
  {
    title: "Modern boutique edit",
    text: "Women's fashion, hijabs, accessories, gifts, and custom pieces selected with a quiet luxury point of view.",
    icon: Sparkles
  },
  {
    title: "Kashmir-first delivery",
    text: "Orders are prepared for courier-based delivery across Kashmir, with support available before and after checkout.",
    icon: MapPin
  },
  {
    title: "Custom work, reviewed first",
    text: "For earrings, frames, cash bouquets, and personalized gifts, the team reviews your request before sharing the final price.",
    icon: HeartHandshake
  }
];

const categories = [
  "Women's Fashion",
  "Hijabs",
  "Custom Earrings",
  "Custom Frames",
  "Cash Bouquets",
  "Personalized Gifts",
  "Accessories",
  "Made to Order"
];

const process = [
  {
    title: "Browse ready products",
    text: "Shop listed products directly with clear stock, offers, wishlist, cart, and checkout.",
    icon: PackageCheck
  },
  {
    title: "Request custom pieces",
    text: "Share references, delivery area, preferred date, and requirements. Budget is optional.",
    icon: CalendarCheck
  },
  {
    title: "Confirm before payment",
    text: "For custom orders, Rida Boutique contacts you with the final price before payment.",
    icon: Phone
  }
];

const standards = [
  "Standard products are return eligible when unused and in original condition.",
  "Custom earrings, frames, personalized gifts, and cash bouquets are not return eligible.",
  "Reviews are published after admin approval and only verified buyers can review."
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-28 md:pt-40">
      <section className="luxury-container pb-10 md:pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold">
              About Rida Boutique
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-brand-green sm:text-5xl md:text-6xl">
              Luxury shopping made calm, personal, and practical.
            </h1>
            <p className="mt-5 text-sm leading-7 text-brand-charcoal/68 md:text-base">
              Rida Boutique is a modern international luxury boutique based in Kashmir, created for
              refined women's fashion, elegant gifting, accessories, hijabs, and made-to-order pieces.
              The experience is designed to feel premium without making shopping complicated.
            </p>
            <div className="mt-7 grid gap-3 sm:flex">
              <ButtonLink className="w-full sm:w-auto" href="/shop" size="lg">
                Shop Now
              </ButtonLink>
              <ButtonLink className="w-full sm:w-auto" href="/custom-orders" size="lg" variant="outline">
                Request Custom
              </ButtonLink>
            </div>
          </div>

          <div className="order-1 overflow-hidden rounded-2xl bg-brand-green shadow-luxury lg:order-2 lg:rounded-[2rem]">
            <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
              <Image
                alt="Rida Boutique modern luxury fashion mood"
                className="object-cover opacity-85"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={heroImage}
              />
              <div className="absolute inset-x-0 bottom-0 bg-brand-green/88 p-4 text-brand-ivory sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                  Kashmir Only For Now
                </p>
                <p className="mt-2 font-serif text-2xl">Fashion, gifts, and custom creations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="luxury-container">
          <div className="grid gap-3 md:grid-cols-3 md:gap-5">
            {promises.map((item) => {
              const Icon = item.icon;

              return (
                <article className="rounded-2xl border border-brand-green/10 bg-brand-ivory p-4 sm:p-5" key={item.title}>
                  <Icon className="size-5 text-brand-gold" />
                  <h2 className="mt-4 font-serif text-2xl text-brand-green">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-charcoal/62">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="luxury-container py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div>
            <SectionHeading
              description="Rida Boutique keeps all shopping under one focused shop experience. Collections, categories, offers, and product details are there so customers can move fast."
              eyebrow="What We Offer"
              title="Everything boutique shoppers actually look for."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  className="rounded-full border border-brand-green/10 bg-white px-4 py-2 text-xs font-semibold text-brand-green shadow-[0_1px_0_rgba(6,40,31,0.08)]"
                  key={category}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {process.map((item) => {
              const Icon = item.icon;

              return (
                <article className="flex gap-4 rounded-2xl border border-brand-green/10 bg-white p-4 shadow-[0_1px_0_rgba(6,40,31,0.08)] sm:p-5" key={item.title}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-green text-brand-gold">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl text-brand-green">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-brand-charcoal/62">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-brand-green py-10 text-brand-ivory md:py-14">
        <div className="luxury-container grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold">
              Boutique Standards
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
              Clear rules, careful fulfilment, and support when it matters.
            </h2>
          </div>
          <div className="grid gap-3">
            {standards.map((standard) => (
              <p className="flex gap-3 rounded-2xl bg-brand-ivory/8 p-4 text-sm leading-6 text-brand-ivory/78" key={standard}>
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-gold" />
                {standard}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-container py-10 md:py-16">
        <div className="grid gap-4 rounded-2xl border border-brand-gold/25 bg-white p-5 shadow-luxury sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-cream text-brand-gold">
              <BadgeCheck className="size-5" />
            </span>
            <div>
              <p className="font-serif text-2xl text-brand-green sm:text-3xl">
                Need something made for an occasion?
              </p>
              <p className="mt-2 text-sm leading-6 text-brand-charcoal/62">
                Send the idea first. The team reviews references and contacts you with the price before checkout.
              </p>
            </div>
          </div>
          <ButtonLink className="w-full md:w-auto" href="/custom-orders" variant="gold">
            Start Custom Order
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
