import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  CreditCard,
  Frame,
  Gem,
  Gift,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import { SectionHeading } from "@/components/commerce/section-heading";
import { TestimonialCard } from "@/components/commerce/testimonial-card";
import { Reveal } from "@/components/motion/reveal";
import { products, testimonials } from "@/data/store";

const categories = [
  { label: "Fashion", href: "/shop?query=suits", icon: Shirt, count: "Suits & dresses" },
  { label: "Earrings", href: "/shop?query=custom earrings", icon: Gem, count: "Custom made" },
  { label: "Frames", href: "/shop?query=custom frame", icon: Frame, count: "Personalized" },
  { label: "Bouquets", href: "/shop?query=cash bouquet", icon: CircleDollarSign, count: "Cash gifts" },
  { label: "Hijabs", href: "/shop?query=hijab", icon: Sparkles, count: "Daily & occasion" },
  { label: "Gifts", href: "/shop?query=personalized gift", icon: Gift, count: "Curated boxes" }
];

const trustItems = [
  { label: "Kashmir delivery", icon: Truck },
  { label: "Secure Razorpay", icon: CreditCard },
  { label: "Verified reviews", icon: ShieldCheck },
  { label: "WhatsApp support", icon: MessageCircle }
];

const customSteps = [
  ["Send references", "Upload image, links, budget and date."],
  ["Admin prices it", "We review details and set final price."],
  ["Pay online", "Approved custom order converts to checkout."]
];

export default function Home() {
  const newArrivals = products.filter((product) => product.isNew).slice(0, 4);
  const bestSellers = products.filter((product) => product.isBestSeller).slice(0, 4);
  const customCreations = products.filter((product) => product.collection === "custom-creations").slice(0, 4);
  const heroProduct = newArrivals[0] || products[0];

  return (
    <main className="bg-brand-ivory">
      <section className="bg-brand-green pb-5 pt-28 text-brand-ivory md:pb-8 md:pt-36">
        <div className="luxury-container grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold sm:text-xs">
              Rida Boutique | Kashmir only
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-none sm:text-5xl md:text-7xl">
              Shop luxury fashion, gifts and custom pieces.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-brand-ivory/75 sm:text-base sm:leading-7">
              Direct checkout for women&apos;s fashion, hijabs, earrings, frames, cash bouquets,
              accessories and made-to-order gifts.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex">
              <ButtonLink className="w-full sm:w-auto" href="/shop" size="lg" variant="gold">
                Shop Now
              </ButtonLink>
              <ButtonLink className="w-full sm:w-auto" href="/custom-orders" size="lg" variant="secondary">
                Custom Order
              </ButtonLink>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:max-w-lg sm:grid-cols-3">
              {["New arrivals", "Best sellers", "Custom gifts"].map((item) => (
                <Link
                  className="rounded-2xl border border-brand-gold/25 bg-white/10 px-3 py-3 font-semibold text-brand-ivory transition hover:bg-brand-gold hover:text-brand-green"
                  href={`/shop?query=${encodeURIComponent(item)}`}
                  key={item}
                >
                  {item}
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Link
              className="group grid grid-cols-[104px_1fr] gap-4 rounded-2xl border border-brand-gold/25 bg-white/10 p-3 backdrop-blur transition hover:bg-white/15 sm:grid-cols-[140px_1fr] lg:block lg:p-4"
              href={`/product/${heroProduct.slug}`}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-cream lg:aspect-square">
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
        </div>
      </section>

      <section className="border-b border-brand-green/10 bg-white py-3">
        <div className="luxury-container no-scrollbar flex gap-2 overflow-x-auto sm:grid sm:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                className="flex min-w-[164px] items-center gap-2 rounded-xl bg-brand-cream px-3 py-3 text-xs font-bold text-brand-green sm:min-w-0 sm:text-sm"
                key={item.label}
              >
                <Icon className="size-4 shrink-0 text-brand-gold" />
                {item.label}
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-8 md:py-12">
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
              href="/shop"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-[0_1px_0_rgba(6,40,31,0.08)] transition hover:-translate-y-1 hover:border-brand-gold hover:shadow-luxury"
                  href={category.href}
                  key={category.label}
                >
                  <Icon className="size-5 text-brand-gold" />
                  <p className="mt-4 font-serif text-2xl leading-none text-brand-green">
                    {category.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-brand-charcoal/55">{category.count}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-8 md:pb-12">
        <div className="luxury-container grid gap-3 md:grid-cols-2">
          <Link
            className="group rounded-2xl bg-brand-green p-5 text-brand-ivory shadow-luxury transition hover:-translate-y-1"
            href="/custom-orders"
          >
            <Gift className="size-6 text-brand-gold" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Custom orders
            </p>
            <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
              Frames, earrings, bouquets and gifts made to brief.
            </h2>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
              Request now <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            className="group rounded-2xl border border-brand-green/10 bg-white p-5 text-brand-green shadow-luxury transition hover:-translate-y-1"
            href="/shop?sort=popularity"
          >
            <ShoppingBag className="size-6 text-brand-gold" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Ready to ship
            </p>
            <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
              Browse available pieces with clear pricing and checkout.
            </h2>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
              Shop best sellers <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      <ProductSection
        eyebrow="New Arrivals"
        href="/shop?sort=newest"
        products={newArrivals}
        title="Fresh in store."
      />

      <ProductSection
        eyebrow="Best Sellers"
        href="/shop?sort=popularity"
        products={bestSellers}
        title="Customer favourites."
        tone="white"
      />

      <section className="py-8 md:py-12">
        <div className="luxury-container">
          <div className="rounded-2xl bg-brand-green p-5 text-brand-ivory md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                  Custom workflow
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
                  Send reference. Get price. Pay online.
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {customSteps.map(([title, text], index) => (
                  <div className="rounded-2xl border border-brand-gold/25 p-4" key={title}>
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

      <ProductSection
        eyebrow="Custom Creations"
        href="/custom-orders"
        products={customCreations}
        title="Made for your occasion."
      />

      <section className="bg-white py-8 md:py-12">
        <div className="luxury-container">
          <SectionHeading
            description="Short, real purchase confidence before checkout."
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

      <section className="py-8 md:py-12">
        <div className="luxury-container rounded-2xl border border-brand-green/10 bg-white p-5 shadow-luxury md:p-7">
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

function ProductSection({
  eyebrow,
  href,
  products,
  title,
  tone = "ivory"
}: {
  eyebrow: string;
  href: string;
  products: typeof import("@/data/store").products;
  title: string;
  tone?: "ivory" | "white";
}) {
  return (
    <section className={tone === "white" ? "bg-white py-8 md:py-12" : "py-8 md:py-12"}>
      <div className="luxury-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-brand-green sm:text-4xl">{title}</h2>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-green transition hover:text-brand-gold"
            href={href}
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
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
