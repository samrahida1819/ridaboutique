"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { ThemeToggle } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { megaMenu, trendingSearches } from "@/data/store";
import { useCatalog } from "@/hooks/use-store-data";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Custom Orders", href: "/custom-orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

const mobileShopItems = Array.from(
  new Set(megaMenu.find((group) => group.title === "Shop")?.items || [])
);

const mobileNavLinks = [...navLinks, { label: "Wishlist", href: "/wishlist" }];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { products } = useCatalog();
  const { cartCount, wishlistCount } = useShop();
  const { authReady, isAuthenticated, requestLogin, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());

    function onPointerDown(event: PointerEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
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
  }, [products, query]);

  const isTransparent = pathname === "/" && !scrolled && !mobileOpen && !searchOpen;
  const navTone = "text-brand-ivory";

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
    router.push(`/products?query=${encodeURIComponent(next)}`);
  }

  function handleMobileAccountClick() {
    if (!isAuthenticated) {
      requestLogin("Sign in with email to open your profile.");
    } else {
      router.push("/account");
    }

    setMobileOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-luxury",
          isTransparent ? "border-transparent bg-transparent" : "glass-green"
        )}
      >
        <nav className="luxury-container flex h-14 items-center justify-between gap-2 sm:h-16 md:h-[74px] md:gap-5">
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
            <form
              className={cn(
                "relative flex h-9 shrink-0 items-center rounded-full transition-all duration-300 ease-luxury sm:h-10",
                searchOpen
                  ? "w-[calc(100vw-5.25rem)] max-w-60 border border-brand-gold/30 bg-white px-0 text-brand-green shadow-luxury sm:w-56 md:w-64"
                  : "w-9 text-brand-ivory hover:bg-white/10 sm:w-10"
              )}
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
              ref={searchRef}
            >
              <button
                aria-label={searchOpen ? "Submit search" : "Open search"}
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full transition sm:size-10",
                  searchOpen ? "text-brand-green hover:text-brand-gold" : "text-brand-ivory"
                )}
                onClick={(event) => {
                  if (!searchOpen) {
                    event.preventDefault();
                    setSearchOpen(true);
                  }
                }}
                type={searchOpen ? "submit" : "button"}
              >
                <Search className="size-4" />
              </button>
              <input
                aria-label="Search products"
                className={cn(
                  "min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium outline-none placeholder:text-brand-green/45",
                  searchOpen ? "w-full opacity-100" : "pointer-events-none w-0 opacity-0"
                )}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                ref={searchInputRef}
                tabIndex={searchOpen ? 0 : -1}
                value={query}
              />
              {searchOpen && query ? (
                <button
                  aria-label="Clear search"
                  className="mr-1 grid size-7 shrink-0 place-items-center rounded-full text-brand-green/55 transition hover:bg-brand-cream hover:text-brand-green"
                  onClick={() => setQuery("")}
                  type="button"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
              {searchOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.65rem)] w-[min(18rem,calc(100vw-1rem))] rounded-2xl border border-brand-gold/20 bg-white p-2 text-brand-green shadow-luxury">
                  <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">
                    {query.trim() ? "Suggestions" : "Popular searches"}
                  </p>
                  <div className="grid gap-1">
                    {suggestions.slice(0, 5).map((item) => (
                      <button
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-brand-cream"
                        key={item}
                        onClick={() => submitSearch(item)}
                        type="button"
                      >
                        <span className="min-w-0 truncate">{item}</span>
                        <ArrowRight className="size-4 shrink-0 text-brand-gold" />
                      </button>
                    ))}
                    {!query.trim() && recentSearches.length ? (
                      <div className="border-t border-brand-green/10 pt-1">
                        {recentSearches.slice(0, 3).map((item) => (
                          <button
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-brand-green/70 transition hover:bg-brand-cream hover:text-brand-green"
                            key={item}
                            onClick={() => submitSearch(item)}
                            type="button"
                          >
                            <span className="min-w-0 truncate">{item}</span>
                            <Search className="size-3.5 shrink-0 text-brand-gold" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </form>
            <ThemeToggle
              className={cn(
                "hidden border-brand-gold/25 text-brand-ivory ring-brand-gold/25 hover:bg-white/10 hover:text-brand-gold sm:inline-flex",
                searchOpen && "sm:hidden"
              )}
              compact
            />
            <IconLink
              className={cn("hidden sm:inline-flex", searchOpen && "sm:hidden")}
              count={wishlistCount}
              href="/wishlist"
              label="Wishlist"
            >
              <Heart className="size-4" />
            </IconLink>
            <IconLink className={searchOpen ? "hidden sm:inline-flex" : undefined} count={cartCount} href="/cart" label="Cart">
              <ShoppingBag className="size-4" />
            </IconLink>
            <IconLink
              className={cn("hidden sm:inline-flex", searchOpen && "sm:hidden")}
              href={isAuthenticated ? "/account" : "/login"}
              label={isAuthenticated ? "Profile" : "Login"}
            >
              <UserRound className="size-4" />
            </IconLink>
            <Button
              aria-label="Open menu"
              className={cn("text-brand-ivory lg:hidden", searchOpen && "hidden sm:inline-flex")}
              onClick={() => setMobileOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </nav>
      </header>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="right" title="Menu">
        <button
          className="mb-4 flex w-full items-center gap-3 rounded-xl border border-brand-gold/35 bg-brand-green px-4 py-4 text-left text-brand-ivory shadow-luxury"
          onClick={handleMobileAccountClick}
          type="button"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gold text-brand-green">
            <UserRound className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-2xl leading-tight">
              {isAuthenticated ? "Your Profile" : "Login With Email"}
            </span>
            <span className="mt-1 block truncate text-xs text-brand-ivory/68">
              {isAuthenticated
                ? user?.name || "Manage account, orders, and wishlist"
                : authReady
                  ? "Open account, cart, wishlist, and orders"
                  : "Checking your account"}
            </span>
          </span>
        </button>
        <div className="grid gap-2">
          {mobileNavLinks.map((link) => (
            <Link
              className="rounded-xl border border-brand-green/10 px-4 py-3 font-serif text-lg text-brand-green transition hover:border-brand-gold hover:bg-brand-cream sm:text-xl"
              href={link.href}
              key={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-brand-green/10 bg-white px-4 py-3 text-sm font-semibold text-brand-green">
          <span>Theme</span>
          <ThemeToggle compact />
        </div>
        <div className="mt-6 rounded-2xl bg-brand-green p-4 text-brand-ivory sm:p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">Browse categories</p>
          <div className="mt-3 grid gap-1">
            {mobileShopItems.slice(0, 6).map((item) => (
              <Link
                className="flex items-center justify-between rounded-full px-1 py-2 text-sm text-brand-ivory/75"
                href={`/products?query=${encodeURIComponent(item)}`}
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
