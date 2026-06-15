import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const footerLinks = [
  {
    title: "Boutique",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Custom Orders", href: "/custom-orders" },
      { label: "Wishlist", href: "/wishlist" }
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Orders", href: "/orders" },
      { label: "Returns & Refunds", href: "/returns-refunds" },
      { label: "Account", href: "/account" }
    ]
  }
];

const contactItems = [
  {
    label: "Kashmir only",
    href: "/contact",
    icon: MapPin
  },
  {
    label: "care@ridaboutique.in",
    href: "mailto:care@ridaboutique.in",
    icon: Mail
  },
  {
    label: "+91 70000 00000",
    href: "tel:+917000000000",
    icon: Phone
  },
  {
    label: "WhatsApp order support",
    href: "https://wa.me/917000000000",
    icon: MessageCircle
  }
];

export function Footer() {
  return (
    <footer className="bg-brand-green text-brand-ivory">
      <div className="luxury-container py-8 sm:py-10 lg:py-12">
        <div className="grid gap-9 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold">
              Rida Boutique
            </p>
            <h2 className="mt-3 font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl">
              Modern luxury, delivered across Kashmir.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-brand-ivory/70 sm:text-[15px]">
              Women&apos;s fashion, custom earrings, personalized frames, cash bouquets, hijabs, and
              made-to-order gifts crafted with calm precision.
            </p>
            <div className="mt-6 grid gap-3 sm:max-w-lg sm:grid-cols-2">
              <ButtonLink href="/shop" variant="gold" className="w-full justify-center">
                Shop the Boutique
              </ButtonLink>
              <ButtonLink
                href="/custom-orders"
                variant="ghost"
                className="w-full justify-center text-brand-ivory ring-1 ring-brand-gold/35"
              >
                Request Custom Order
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-0 border-y border-brand-gold/15 sm:grid-cols-2 sm:gap-8 sm:border-y-0">
            {footerLinks.map((group) => (
              <div
                className="border-b border-brand-gold/15 py-5 last:border-b-0 sm:border-b-0 sm:py-0"
                key={group.title}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                  {group.title}
                </p>
                <div className="mt-3 grid">
                  {group.links.map((link) => (
                    <Link
                      className="block py-2.5 text-[15px] text-brand-ivory/72 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60"
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-2 text-sm text-brand-ivory/72 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {contactItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                className="flex min-h-12 items-center gap-3 border-t border-brand-gold/15 py-3 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 sm:border-t-0 sm:py-2"
                href={item.href}
                key={item.label}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                target={item.href.startsWith("http") ? "_blank" : undefined}
              >
                <Icon className="size-4 shrink-0 text-brand-gold" />
                <span className="min-w-0 break-words">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-brand-gold/15 pt-5 text-xs leading-6 text-brand-ivory/52 md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 Rida Boutique. All rights reserved.</p>
          <p>Secure checkout, verified support, and made-to-order gifting.</p>
        </div>
      </div>
    </footer>
  );
}
