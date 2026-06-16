"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  IndianRupee,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tags,
  X
} from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProducts } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory, StockStatus } from "@/types/commerce";

type SortMode = "newest" | "price-low" | "price-high" | "popularity";
type FilterSection = "category" | "price" | "availability" | "sort";

const categoryLabels: Record<ProductCategory | "all", string> = {
  all: "All categories",
  "womens-fashion": "Women's Fashion",
  "custom-earrings": "Custom Earrings",
  "custom-frames": "Custom Frames",
  "cash-bouquets": "Cash Bouquets",
  "custom-gifts": "Custom Gifts",
  hijabs: "Hijabs",
  accessories: "Accessories"
};

const priceOptions = [
  { value: "all", label: "All prices" },
  { value: "0-2000", label: "Under Rs 2,000" },
  { value: "2000-5000", label: "Rs 2,000 - Rs 5,000" },
  { value: "5000-10000", label: "Rs 5,000 - Rs 10,000" }
];

const stockOptions: { value: StockStatus | "all"; label: string }[] = [
  { value: "all", label: "All availability" },
  { value: "In stock", label: "In stock" },
  { value: "Low stock", label: "Low stock" },
  { value: "Made to order", label: "Made to order" },
  { value: "Sold out", label: "Sold out" }
];

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" }
];

export function ShopExplorer({
  initialQuery,
  products
}: {
  initialQuery?: string;
  products: Product[];
}) {
  const [query, setQuery] = useState(initialQuery || "");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [price, setPrice] = useState("all");
  const [stock, setStock] = useState<StockStatus | "all">("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [desktopFilterPanelOpen, setDesktopFilterPanelOpen] = useState(false);
  const catalogProducts = useAdminProducts(products);
  const [openSections, setOpenSections] = useState<Record<FilterSection, boolean>>({
    category: true,
    price: false,
    availability: false,
    sort: false
  });

  useEffect(() => {
    setQuery(initialQuery || "");
  }, [initialQuery]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(window.localStorage.getItem("rida-recent-searches") || "[]"));
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 280);
    return () => window.clearTimeout(timer);
  }, [query, category, price, stock, sort]);

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return recent;
    }

    const normalized = query.toLowerCase();
    return catalogProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.tags.some((tag) => tag.toLowerCase().includes(normalized))
      )
      .slice(0, 6)
      .map((product) => product.name);
  }, [catalogProducts, query, recent]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const [min, max] =
      price === "all"
        ? [0, Number.POSITIVE_INFINITY]
        : price.split("-").map((value) => Number(value));

    return catalogProducts
      .filter((product) => {
        const matchesQuery =
          !normalized ||
          product.name.toLowerCase().includes(normalized) ||
          product.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
          product.description.toLowerCase().includes(normalized);
        const matchesCategory = category === "all" || product.category === category;
        const matchesPrice = product.price >= min && product.price <= max;
        const matchesStock = stock === "all" || product.stockStatus === stock;
        return matchesQuery && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "popularity") return b.reviewCount - a.reviewCount;
        return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      });
  }, [catalogProducts, category, price, query, sort, stock]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    category !== "all" ||
    price !== "all" ||
    stock !== "all" ||
    sort !== "newest";
  const activeFilterCount = [
    Boolean(query.trim()),
    category !== "all",
    price !== "all",
    stock !== "all",
    sort !== "newest"
  ].filter(Boolean).length;
  const currentPriceLabel = priceOptions.find((option) => option.value === price)?.label || "All prices";
  const currentStockLabel = stockOptions.find((option) => option.value === stock)?.label || "All availability";
  const currentSortLabel = sortOptions.find((option) => option.value === sort)?.label || "Newest";
  const activeFilterChips = [
    query.trim()
      ? {
          label: `Search: ${query.trim()}`,
          onRemove: () => setQuery("")
        }
      : null,
    category !== "all"
      ? {
          label: categoryLabels[category],
          onRemove: () => setCategory("all")
        }
      : null,
    price !== "all"
      ? {
          label: currentPriceLabel,
          onRemove: () => setPrice("all")
        }
      : null,
    stock !== "all"
      ? {
          label: currentStockLabel,
          onRemove: () => setStock("all")
        }
      : null,
    sort !== "newest"
      ? {
          label: currentSortLabel,
          onRemove: () => setSort("newest")
        }
      : null
  ].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

  function applySearch(value: string) {
    setQuery(value);
    const nextRecent = [value, ...recent.filter((item) => item !== value)].slice(0, 5);
    setRecent(nextRecent);
    window.localStorage.setItem("rida-recent-searches", JSON.stringify(nextRecent));
  }

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setPrice("all");
    setStock("all");
    setSort("newest");
  }

  function toggleSection(section: FilterSection) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  }

  function openDesktopFilterPanel(section?: FilterSection) {
    setDesktopFilterPanelOpen(true);

    if (section) {
      setOpenSections({
        category: section === "category",
        price: section === "price",
        availability: section === "availability",
        sort: section === "sort"
      });
    }
  }

  function openMobileFilters(section?: FilterSection) {
    setFilterDrawerOpen(true);

    if (section) {
      setOpenSections({
        category: section === "category",
        price: section === "price",
        availability: section === "availability",
        sort: section === "sort"
      });
    }
  }

  function filterControls(showDoneButton = false, onClose?: () => void) {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 rounded-xl bg-brand-cream p-4">
          <div>
            <p className="text-sm font-bold text-brand-green">Filters</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasActiveFilters ? (
              <button
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-brand-green/70 transition hover:bg-white hover:text-brand-green"
                onClick={resetFilters}
                type="button"
              >
                <X className="size-3" />
                Clear
              </button>
            ) : null}
            {onClose ? (
              <button
                aria-label="Close filters"
                className="grid size-9 place-items-center rounded-full bg-white text-brand-green transition hover:bg-brand-gold"
                onClick={onClose}
                type="button"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        <FilterGroup
          active={category !== "all"}
          open={openSections.category}
          title="Category"
          value={categoryLabels[category]}
          onToggle={() => toggleSection("category")}
        >
          <div className="grid gap-2">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <ChoiceButton
                active={category === value}
                key={value}
                onClick={() => setCategory(value as ProductCategory | "all")}
              >
                {label}
              </ChoiceButton>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          active={price !== "all"}
          open={openSections.price}
          title="Price"
          value={currentPriceLabel}
          onToggle={() => toggleSection("price")}
        >
          <div className="grid gap-2">
            {priceOptions.map((option) => (
              <ChoiceButton
                active={price === option.value}
                key={option.value}
                onClick={() => setPrice(option.value)}
              >
                {option.label}
              </ChoiceButton>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          active={stock !== "all"}
          open={openSections.availability}
          title="Availability"
          value={currentStockLabel}
          onToggle={() => toggleSection("availability")}
        >
          <div className="grid gap-2">
            {stockOptions.map((option) => (
              <ChoiceButton
                active={stock === option.value}
                key={option.value}
                onClick={() => setStock(option.value)}
              >
                {option.label}
              </ChoiceButton>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          active={sort !== "newest"}
          open={openSections.sort}
          title="Sort by"
          value={currentSortLabel}
          onToggle={() => toggleSection("sort")}
        >
          <div className="grid gap-2">
            {sortOptions.map((option) => (
              <ChoiceButton
                active={sort === option.value}
                key={option.value}
                onClick={() => setSort(option.value)}
              >
                {option.label}
              </ChoiceButton>
            ))}
          </div>
        </FilterGroup>

        {showDoneButton ? (
          <div className="sticky bottom-0 -mx-6 border-t border-brand-green/10 bg-brand-ivory px-6 pb-1 pt-4">
            <Button className="w-full" onClick={() => setFilterDrawerOpen(false)}>
              Apply filters
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pb-40 lg:pb-0">
      <Drawer
        className="max-w-[23rem]"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        side="left"
        title="Filters"
      >
        {filterControls(true)}
      </Drawer>

      <div className="rounded-xl border border-brand-green/10 bg-white p-3 shadow-luxury sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/45" />
            <Input
              className="pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              value={query}
            />
          </div>

          <div className="hidden lg:block">
            <Select
              aria-label="Sort products"
              className="h-11"
              onChange={(event) => setSort(event.target.value as SortMode)}
              value={sort}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {Object.entries(categoryLabels).map(([value, label]) => (
            <button
              aria-pressed={category === value}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition",
                category === value
                  ? "bg-brand-green text-brand-ivory shadow-luxury"
                  : "bg-brand-cream text-brand-green hover:bg-brand-champagne/45"
              )}
              key={value}
              onClick={() => setCategory(value as ProductCategory | "all")}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {suggestions.length || hasActiveFilters ? (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
            {suggestions.slice(0, 5).map((item) => (
              <button
                className="shrink-0 rounded-full bg-brand-cream px-3 py-2 text-xs font-semibold text-brand-green transition hover:bg-brand-champagne/45"
                key={item}
                onClick={() => applySearch(item)}
                type="button"
              >
                {item}
              </button>
            ))}
            {hasActiveFilters ? (
              <button
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-green/10 px-3 py-2 text-xs font-semibold text-brand-green/65 transition hover:border-brand-gold/40 hover:text-brand-green"
                onClick={resetFilters}
                type="button"
              >
                <X className="size-3" />
                Clear
              </button>
            ) : null}
          </div>
        ) : null}

        {activeFilterChips.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-green/10 bg-white px-3 text-xs font-semibold text-brand-green shadow-sm transition hover:border-brand-gold/45"
                key={chip.label}
                onClick={chip.onRemove}
                type="button"
              >
                {chip.label}
                <X className="size-3" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-5 grid gap-5 lg:items-start",
          desktopFilterPanelOpen
            ? "lg:grid-cols-[76px_280px_minmax(0,1fr)]"
            : "lg:grid-cols-[76px_minmax(0,1fr)]"
        )}
      >
        <aside className="hidden h-fit rounded-xl border border-brand-gold/20 bg-brand-green p-2 text-brand-ivory shadow-luxury lg:sticky lg:top-32 lg:block">
          <div className="grid gap-2">
            <div className="grid min-h-10 place-items-center rounded-lg border border-brand-gold/20 bg-white/5">
              <SlidersHorizontal className="size-4 text-brand-gold" />
            </div>
            <IconRailButton
              active={desktopFilterPanelOpen}
              label="Open filters"
              onClick={() => openDesktopFilterPanel()}
            >
              <SlidersHorizontal className="size-4" />
            </IconRailButton>
            <IconRailButton
              active={category !== "all"}
              label={`Category: ${categoryLabels[category]}`}
              onClick={() => openDesktopFilterPanel("category")}
            >
              <Tags className="size-4" />
            </IconRailButton>
            <IconRailButton
              active={price !== "all"}
              label={`Price: ${currentPriceLabel}`}
              onClick={() => openDesktopFilterPanel("price")}
            >
              <IndianRupee className="size-4" />
            </IconRailButton>
            <IconRailButton
              active={stock !== "all"}
              label={`Availability: ${currentStockLabel}`}
              onClick={() => openDesktopFilterPanel("availability")}
            >
              <Package className="size-4" />
            </IconRailButton>
            <IconRailButton
              active={sort !== "newest"}
              label={`Sort: ${currentSortLabel}`}
              onClick={() => openDesktopFilterPanel("sort")}
            >
              <ArrowDownUp className="size-4" />
            </IconRailButton>

            {hasActiveFilters ? (
              <IconRailButton active={false} label="Clear filters" onClick={resetFilters}>
                <RotateCcw className="size-4" />
              </IconRailButton>
            ) : null}
          </div>
        </aside>

        {desktopFilterPanelOpen ? (
          <aside className="hidden h-fit rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury lg:sticky lg:top-32 lg:block">
            {filterControls(false, () => setDesktopFilterPanelOpen(false))}
          </aside>
        ) : null}

        <section className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton className="aspect-square" key={index} />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-brand-green/10 bg-white p-8 text-center shadow-luxury sm:p-12">
              <p className="font-serif text-3xl text-brand-green sm:text-4xl">No pieces found.</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-brand-charcoal/60">
                Try a broader search or request a custom piece and the admin team can price it for you.
              </p>
              <Button className="mt-6" onClick={resetFilters}>
                Reset Search
              </Button>
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-3 bottom-[calc(6.15rem+env(safe-area-inset-bottom))] z-40 grid grid-cols-2 gap-2 rounded-full border border-brand-green/10 bg-white/95 p-2 shadow-luxury backdrop-blur lg:hidden">
        <Button className="h-11" onClick={() => openMobileFilters()} variant="primary">
          <SlidersHorizontal className="size-4" />
          Filter
          {activeFilterCount ? (
            <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[11px] text-brand-green">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
        <Button className="h-11" onClick={() => openMobileFilters("sort")} variant="secondary">
          <ArrowDownUp className="size-4" />
          Sort
        </Button>
      </div>
    </div>
  );
}

function FilterGroup({
  active,
  children,
  open,
  title,
  value,
  onToggle
}: {
  active: boolean;
  children: React.ReactNode;
  open: boolean;
  title: string;
  value: string;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-brand-green/10 bg-white">
      <button
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-green/55">
            {title}
          </span>
          <span
            className={cn(
              "mt-1 block truncate text-sm font-semibold",
              active ? "text-brand-green" : "text-brand-charcoal/60"
            )}
          >
            {value}
          </span>
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-brand-green transition", open && "rotate-180")}
        />
      </button>
      {open ? <div className="border-t border-brand-green/10 p-3">{children}</div> : null}
    </div>
  );
}

function ChoiceButton({
  active,
  children,
  count,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition",
        active
          ? "bg-brand-green text-brand-ivory"
          : "bg-brand-cream text-brand-green hover:bg-brand-champagne/45"
      )}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      {typeof count === "number" ? <span className="text-xs opacity-70">{count}</span> : null}
    </button>
  );
}

function IconRailButton({
  active,
  badge,
  children,
  label,
  onClick
}: {
  active: boolean;
  badge?: number;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "relative grid min-h-12 place-items-center rounded-lg transition",
        active
          ? "bg-brand-gold text-brand-green shadow-gold-soft"
          : "bg-white/10 text-brand-ivory hover:bg-white/18 hover:text-brand-gold"
      )}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-green">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
