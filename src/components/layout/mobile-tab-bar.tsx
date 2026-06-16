"use client";

import Link from "next/link";
import { Heart, Home, PackageCheck, ShoppingBag, UserRound, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { cn } from "@/lib/utils";

type MobileTabItem = {
  badge?: number;
  href: string;
  icon: LucideIcon;
  label: string;
  match: string[];
  profile?: boolean;
};

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "";
  }

  return `${parts[0]?.[0] || ""}${parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : ""}`
    .toUpperCase()
    .slice(0, 2);
}

function isActivePath(pathname: string | null, matchers: string[]) {
  return matchers.some((matcher) => (matcher === "/" ? pathname === "/" : pathname?.startsWith(matcher)));
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { wishlistCount } = useShop();
  const initials = getInitials(user?.name, user?.email);

  const items: MobileTabItem[] = [
    { href: "/", icon: Home, label: "Home", match: ["/"] },
    { href: "/products", icon: ShoppingBag, label: "Shop", match: ["/products", "/product", "/shop"] },
    { badge: wishlistCount, href: "/wishlist", icon: Heart, label: "Wishlist", match: ["/wishlist"] },
    { href: "/orders", icon: PackageCheck, label: "Orders", match: ["/orders"] },
    {
      href: isAuthenticated ? "/account" : "/login",
      icon: UserRound,
      label: "Profile",
      match: ["/account", "/login", "/signup"],
      profile: true
    }
  ];

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-3 bottom-[calc(0.8rem+env(safe-area-inset-bottom))] z-[65] md:hidden"
    >
      <div className="mx-auto grid h-[72px] max-w-[26rem] grid-cols-5 items-center gap-1 rounded-[2rem] border border-white/70 bg-white/95 px-2 py-1.5 text-brand-green shadow-luxury ring-1 ring-brand-green/10 backdrop-blur-xl dark:border-white/10 dark:bg-brand-charcoal/95 dark:text-brand-ivory dark:ring-white/10">
        {items.map((item) => {
          const active = isActivePath(pathname, item.match);
          const Icon = item.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-full px-1.5 py-2 text-[10px] font-bold leading-none transition duration-300 ease-luxury",
                active ? "text-brand-green dark:text-brand-gold" : "text-brand-green/60 dark:text-brand-ivory/60"
              )}
              href={item.href}
              key={item.label}
            >
              <span
                className={cn(
                  "relative grid size-8 place-items-center rounded-full transition duration-300 ease-luxury",
                  active
                    ? "bg-brand-gold text-brand-green shadow-gold-soft"
                    : "bg-brand-cream text-brand-green group-hover:bg-brand-champagne/75 dark:bg-white/10 dark:text-brand-ivory dark:group-hover:bg-white/20"
                )}
              >
                {item.profile && initials ? (
                  <span className="text-[11px] font-extrabold leading-none">{initials}</span>
                ) : (
                  <Icon className="size-4" strokeWidth={2.2} />
                )}
                {item.badge ? (
                  <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-brand-green px-1 text-[9px] font-extrabold leading-4 text-brand-ivory ring-2 ring-white dark:bg-brand-gold dark:text-brand-green dark:ring-brand-charcoal">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
