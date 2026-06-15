"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { megaMenu, products, trendingSearches } from "@/data/store";
import { cn } from "@/lib/utils";
import { useShop } from "@/components/providers/shop-provider";
import { useAuth } from "@/components/providers/auth-provider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Custom Orders", href: "/custom-orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlistCount } = useShop();
  const { authReady, isAuthenticated, requestLogin, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      setRecentSearches(JSON.parse(window.localStorage.getItem("rida-recent-searches") || "[]"));
    } catch {
      setRecentSearches([]);
    }
  }, [searchOpen]);

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return trendingSearches;
    }

    const normalized = query.toLowerCase();
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.tags.some((tag) => tag.toLowerCase().includes(normalized))
      )
      .slice(0, 5)
      .map((product) => product.name);
  }, [query]);

  const isTransparent = pathname === "/" && !scrolled && !mobileOpen && !searchOpen;
  const navTone = isTransparent ? "text-brand-ivory" : "text-brand-ivory";

  function submitSearch(value = query) {
    const next = value.trim();
    if (!next) {
      return;
    }

    const merged = [next, ...recentSearches.filter((item) => item !== next)].slice(0, 5);
    window.localStorage.setItem("rida-recent-searches", JSON.stringify(merged));
    setRecentSearches(merged);
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/shop?query=${encodeURIComponent(next)}`);
  }

  function handleMobileAccountClick() {
    if (!isAuthenticated) {
      requestLogin("Sign in with WhatsApp to open your profile.");
    } else {
      router.push("/account");
    }

    setMobileOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-[33px] z-50 border-b transition-all duration-500 ease-luxury",
          isTransparent
            ? "border-transparent bg-transparent"
            : "glass-green"
        )}
      >
        <nav className="luxury-container flex h-16 items-center justify-between gap-2 md:h-[74px] md:gap-5">
          <Link
            aria-label="Rida Boutique home"
            className={cn("shrink-0 font-serif text-xl font-semibold tracking-normal sm:text-2xl", navTone)}
            href="/"
          >
            Rida
            <span className="hidden sm:inline"> Boutique</span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                className={cn(
                  "relative py-2 text-xs font-semibold uppercase tracking-[0.22em] transition hover:text-brand-gold after:absolute after:inset-x-0 after:-bottom-1 after:mx-auto after:h-px after:w-0 after:bg-brand-gold after:transition-all after:duration-300 hover:after:w-full",
                  navTone,
                  pathname === link.href && "text-brand-gold after:w-full"
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="size-4" />
            </IconButton>
            <IconLink count={wishlistCount} href="/wishlist" label="Wishlist">
              <Heart className="size-4" />
            </IconLink>
            <IconLink count={cartCount} href="/cart" label="Cart">
              <ShoppingBag className="size-4" />
            </IconLink>
            <IconLink href="/account" label={isAuthenticated ? "Profile" : "Login"}>
              <UserRound className="size-4" />
            </IconLink>
            <Button
              aria-label="Open menu"
              className="text-brand-ivory lg:hidden"
              onClick={() => setMobileOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </nav>

      </header>

      {searchOpen ? (
        <div className="fixed inset-x-0 top-[97px] z-[49] border-b border-brand-gold/20 bg-brand-green/96 py-3 text-brand-ivory shadow-luxury backdrop-blur-xl md:top-[107px] md:py-4">
          <div className="luxury-container">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
            >
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/50" />
                <Input
                  autoFocus
                  className="bg-white pl-11"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products..."
                  value={query}
                />
              </div>
              <Button aria-label="Submit search" size="icon" type="submit" variant="gold">
                <Search className="size-4" />
              </Button>
              <Button
                aria-label="Close search"
                className="text-brand-ivory hover:bg-white/10"
                onClick={() => setSearchOpen(false)}
                size="icon"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </form>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
              {suggestions.slice(0, 6).map((item) => (
                <button
                  className="shrink-0 rounded-full border border-brand-gold/25 bg-white/10 px-4 py-2 text-xs font-semibold text-brand-ivory transition hover:bg-brand-gold hover:text-brand-green"
                  key={item}
                  onClick={() => submitSearch(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="right" title="Menu">
        <button
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-brand-gold/35 bg-brand-green px-4 py-4 text-left text-brand-ivory shadow-luxury"
          onClick={handleMobileAccountClick}
          type="button"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gold text-brand-green">
            <UserRound className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-2xl leading-tight">
              {isAuthenticated ? "Your Profile" : "Login With WhatsApp"}
            </span>
            <span className="mt-1 block truncate text-xs text-brand-ivory/68">
              {isAuthenticated
                ? user?.name || "Manage account, addresses, and orders"
                : authReady
                  ? "Open account, cart, wishlist, and saved addresses"
                  : "Checking your account"}
            </span>
          </span>
        </button>
        <div className="grid gap-3">
          {navLinks.map((link) => (
            <Link
              className="rounded-2xl border border-brand-green/10 px-4 py-3 font-serif text-xl text-brand-green transition hover:border-brand-gold hover:bg-brand-cream"
              href={link.href}
              key={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-brand-green p-5 text-brand-ivory">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">Shop categories</p>
          <div className="mt-4 grid gap-2">
            {megaMenu.flatMap((group) => group.items).slice(0, 10).map((item) => (
              <Link
                className="flex items-center justify-between rounded-full px-1 py-2 text-sm text-brand-ivory/75"
                href={`/shop?query=${encodeURIComponent(item)}`}
                key={item}
                onClick={() => setMobileOpen(false)}
              >
                {item}
                <ArrowRight className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      </Drawer>

    </>
  );
}

function IconButton({
  children,
  label,
  onClick
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      aria-label={label}
      className="relative size-9 text-brand-ivory hover:bg-white/10 sm:size-10"
      onClick={onClick}
      size="icon"
      variant="ghost"
    >
      {children}
    </Button>
  );
}

function IconLink({
  children,
  className,
  count,
  href,
  label
}: {
  children: React.ReactNode;
  className?: string;
  count?: number;
  href: string;
  label: string;
}) {
  return (
    <Link
      aria-label={label}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full text-brand-ivory transition hover:bg-white/10 sm:size-10",
        className
      )}
      href={href}
    >
      {children}
      {count ? (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-green">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
