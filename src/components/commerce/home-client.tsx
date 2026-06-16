"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Frame,
  Gem,
  Gift,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck
} from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { SectionHeading } from "@/components/commerce/section-heading";
import { TestimonialCard } from "@/components/commerce/testimonial-card";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { testimonials } from "@/data/store";
import { useBanners, useCatalog } from "@/hooks/use-store-data";
import type { Banner, Product } from "@/types/commerce";

const categories = [
  { label: "Fashion", href: "/products?query=suits", icon: Shirt, count: "Suits & dresses" },
  { label: "Earrings", href: "/products?query=custom earrings", icon: Gem, count: "Custom made" },
  { label: "Frames", href: "/products?query=custom frame", icon: Frame, count: "Personalized" },
  { label: "Bouquets", href: "/products?query=cash bouquet", icon: CircleDollarSign, count: "Cash gifts" },
  { label: "Hijabs", href: "/products?query=hijab", icon: Sparkles, count: "Daily & occasion" },
  { label: "Gifts", href: "/products?query=personalized gift", icon: Gift, count: "Curated boxes" }
];

const trustItems = [
  { label: "Boutique delivery", icon: Truck },
  { label: "Secure email login", icon: ShieldCheck },
  { label: "WhatsApp support", icon: MessageCircle }
];

const customSteps = [
  ["Send references", "Share image, budget, product type and date."],
  ["Admin prices it", "We review details and confirm availability."],
  ["Buy now", "Approved products can be ordered through the store."]
];

function uniqueProducts(productList: Product[]) {
  const seen = new Set<string>();

  return productList.filter((product) => {
    if (seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
}

function isCustomProduct(product: Product) {
  return product.collection === "custom-creations" || product.category === "custom-gifts";
}

function takeUniqueProducts(candidates: Product[], usedProductIds: Set<string>, limit = 4) {
  const selected: Product[] = [];

  for (const product of candidates) {
    if (selected.length >= limit) {
      break;
    }

    if (!usedProductIds.has(product.id)) {
      selected.push(product);
      usedProductIds.add(product.id);
    }
  }

  return selected;
}

export function HomeClient() {
  const { products } = useCatalog(true);
  const { banners } = useBanners(true);
  const catalogProducts = uniqueProducts(products.filter((product) => product.isActive !== false));
  const heroProduct =
    catalogProducts.find((product) => product.isNew || product.isFeatured) || catalogProducts[0];
  const usedProductIds = new Set<string>(heroProduct ? [heroProduct.id] : []);
  const newArrivals = takeUniqueProducts(
    catalogProducts.filter(
      (product) =>
        !isCustomProduct(product) &&
        (product.isNew || product.collection === "new-arrivals" || product.isFeatured)
    ),
    usedProductIds
  );
  const bestSellers = takeUniqueProducts(
    catalogProducts.filter(
      (product) => product.isBestSeller || product.collection === "best-sellers"
    ),
    usedProductIds
  );
  const customCreations = takeUniqueProducts(catalogProducts.filter(isCustomProduct), usedProductIds);
  const marketingBanner = banners[0];

  return (
    <main className="bg-brand-ivory">
      <section className="bg-brand-green pb-6 pt-24 text-brand-ivory sm:pt-28 md:pb-8 md:pt-36">
        <div className="luxury-container grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold sm:text-xs">
              Rida Boutique
            </p>
            <h1 className="mt-3 max-w-[22rem] font-serif text-3xl leading-[0.98] sm:max-w-3xl sm:text-5xl md:text-7xl">
              Shop luxury fashion, gifts and custom pieces.
            </h1>
            <p className="mt-4 max-w-[21rem] text-sm leading-6 text-brand-ivory/75 sm:max-w-2xl sm:text-base sm:leading-7">
              Direct ordering for women&apos;s fashion, hijabs, earrings, frames, cash bouquets,
              accessories and made-to-order gifts.
            </p>
            <div className="mt-6 grid gap-3 sm:flex">
              <ButtonLink className="w-full sm:w-auto" href="/products" size="lg" variant="gold">
                Shop Now
              </ButtonLink>
              <ButtonLink className="w-full sm:w-auto" href="/custom-orders" size="lg" variant="secondary">
                Custom Order
              </ButtonLink>
            </div>
          </Reveal>

          {heroProduct ? (
            <Reveal delay={0.08}>
              <Link
                className="group grid grid-cols-[92px_1fr] gap-3 rounded-xl border border-brand-gold/25 bg-white/10 p-2.5 backdrop-blur transition hover:bg-white/15 sm:grid-cols-[132px_1fr] sm:gap-4 sm:p-3 lg:block lg:p-4"
                href={`/products/${heroProduct.slug}`}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-cream sm:rounded-xl lg:aspect-square">
                  <Image
                    alt={heroProduct.name}
                    className="object-cover transition duration-700 group-hover:scale-105"
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, 160px"
                    src={heroProduct.image}
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-brand-gold px-2 py-1 text-[10px] font-bold uppercase text-brand-green">
                    New
                  </span>
                </div>
                <div className="flex min-w-0 flex-col justify-center lg:mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                    Featured piece
                  </p>
                  <h2 className="mt-2 line-clamp-2 font-serif text-2xl leading-tight text-brand-ivory sm:text-3xl">
                    {heroProduct.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-brand-champagne">
                    Tap to view details
                  </p>
                </div>
              </Link>
            </Reveal>
          ) : null}
        </div>
      </section>

      <section className="border-b border-brand-green/10 bg-white py-2.5 sm:py-3">
        <div className="luxury-container no-scrollbar flex gap-2 overflow-x-auto sm:grid sm:grid-cols-3">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                className="flex min-w-[150px] items-center gap-2 rounded-lg bg-brand-cream px-3 py-2.5 text-xs font-bold text-brand-green sm:min-w-0 sm:rounded-xl sm:py-3 sm:text-sm"
                key={item.label}
              >
                <Icon className="size-4 shrink-0 text-brand-gold" />
                {item.label}
              </div>
            );
          })}
        </div>
      </section>

      {marketingBanner ? <MarketingBanner banner={marketingBanner} /> : null}

      <section className="py-6 md:py-12">
        <div className="luxury-container">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                Categories
              </p>
              <h2 className="mt-2 font-serif text-3xl text-brand-green sm:text-4xl">
                Shop faster.
              </h2>
            </div>
            <Link
              className="hidden items-center gap-2 text-sm font-semibold text-brand-green transition hover:text-brand-gold sm:inline-flex"
              href="/products"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  className="rounded-xl border border-brand-green/10 bg-white p-3 shadow-[0_1px_0_rgba(6,40,31,0.08)] transition hover:-translate-y-1 hover:border-brand-gold hover:shadow-luxury sm:rounded-2xl sm:p-4"
                  href={category.href}
                  key={category.label}
                >
                  <Icon className="size-5 text-brand-gold" />
                  <p className="mt-3 font-serif text-xl leading-none text-brand-green sm:mt-4 sm:text-2xl">
                    {category.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-brand-charcoal/55">{category.count}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ProductSection eyebrow="New Arrivals" href="/products?sort=newest" products={newArrivals} title="Fresh in store." />
      <ProductSection eyebrow="Best Sellers" href="/products?sort=popularity" products={bestSellers} title="Customer favourites." tone="white" />

      <section className="py-6 md:py-12">
        <div className="luxury-container">
          <div className="rounded-xl bg-brand-green p-4 text-brand-ivory sm:rounded-2xl sm:p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                  Custom workflow
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
                  Send reference. Get price. Buy now.
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {customSteps.map(([title, text], index) => (
                  <div className="rounded-xl border border-brand-gold/25 p-4 sm:rounded-2xl" key={title}>
                    <span className="grid size-8 place-items-center rounded-full bg-brand-gold text-sm font-bold text-brand-green">
                      {index + 1}
                    </span>
                    <p className="mt-4 font-serif text-2xl">{title}</p>
                    <p className="mt-2 text-xs leading-5 text-brand-ivory/65">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductSection eyebrow="Custom Creations" href="/custom-orders" products={customCreations} title="Made for your occasion." />

      <section className="bg-white py-6 md:py-12">
        <div className="luxury-container">
          <SectionHeading
            description="Short, real purchase confidence before buying."
            eyebrow="Customer Notes"
            title="Loved for service."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal delay={index * 0.05} key={testimonial.name}>
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 md:py-12">
        <div className="luxury-container rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:rounded-2xl sm:p-5 md:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_0.9fr] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                <HeartHandshake className="size-4" />
                Stay updated
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-brand-green sm:text-4xl">
                New drops, custom slots and first-order offers.
              </h2>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                className="h-12 min-w-0 flex-1 rounded-full border border-brand-green/15 bg-brand-cream px-5 text-sm text-brand-green placeholder:text-brand-green/45 focus:border-brand-gold focus:outline-none focus:ring-4 focus:ring-brand-gold/20"
                id="newsletter-email"
                placeholder="Email address"
                type="email"
              />
              <button
                className="h-12 rounded-full bg-brand-green px-7 text-sm font-semibold text-brand-ivory transition hover:bg-brand-deep"
                type="submit"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function MarketingBanner({ banner }: { banner: Banner }) {
  const href = banner.linkUrl?.trim() || "/custom-orders";

  return (
    <section className="bg-brand-ivory py-4 md:py-8">
      <div className="luxury-container">
        <Link
          className="group grid overflow-hidden rounded-xl border border-brand-green/10 bg-white text-brand-green shadow-luxury transition hover:-translate-y-1 hover:border-brand-gold sm:rounded-2xl md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_430px]"
          href={href}
        >
          <div className="flex min-w-0 flex-col justify-center p-4 sm:p-7 lg:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              Custom order spotlight
            </p>
            <h2 className="mt-3 max-w-[21rem] font-serif text-2xl leading-tight sm:max-w-2xl sm:text-4xl md:text-5xl">
              {banner.title}
            </h2>
            {banner.subtitle ? (
              <p className="mt-4 max-w-[21rem] text-sm leading-6 text-brand-charcoal/65 sm:max-w-xl sm:text-base sm:leading-7">
                {banner.subtitle}
              </p>
            ) : null}
            <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-brand-ivory transition group-hover:bg-brand-deep">
              Explore now <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
          <div className="relative min-h-[180px] bg-brand-cream sm:min-h-[220px] md:min-h-[320px]">
            {banner.imageUrl ? (
              <Image
                alt={banner.title}
                className="object-cover transition duration-700 group-hover:scale-105"
                fill
                sizes="(min-width: 1024px) 430px, (min-width: 768px) 360px, 100vw"
                src={banner.imageUrl}
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <Gift className="size-12 text-brand-gold" />
              </div>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}

function ProductSection({
  eyebrow,
  href,
  products,
  title,
  tone = "ivory"
}: {
  eyebrow: string;
  href: string;
  products: Product[];
  title: string;
  tone?: "ivory" | "white";
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className={tone === "white" ? "bg-white py-6 md:py-12" : "py-6 md:py-12"}>
      <div className="luxury-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-brand-green sm:text-4xl">{title}</h2>
          </div>
          <Link
            className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-brand-green transition hover:text-brand-gold sm:inline-flex"
            href={href}
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-5 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal delay={index * 0.05} key={product.id}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
