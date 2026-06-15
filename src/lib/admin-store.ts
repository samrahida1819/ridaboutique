"use client";

import { useEffect, useMemo, useState } from "react";
import { products as fallbackProducts } from "@/data/store";
import type { Product, ProductCategory, StockStatus } from "@/types/commerce";

export const ADMIN_PRODUCTS_KEY = "rida-admin-products";
export const ADMIN_CATEGORIES_KEY = "rida-admin-categories";
export const ADMIN_CUSTOM_ORDERS_KEY = "rida-admin-custom-orders";
export const ADMIN_MESSAGES_KEY = "rida-admin-messages";
export const ADMIN_REVIEWS_KEY = "rida-admin-reviews";
export const ADMIN_SETTINGS_KEY = "rida-admin-settings";

type StoredAdminProduct = {
  id: string;
  sku?: string;
  name: string;
  category: string;
  collection: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  stock: number;
  stockStatus: string;
  description: string;
  image: string;
  thumbnail?: string;
  tags: string;
  published: boolean;
  featured: boolean;
  returnEligible: boolean;
};

export type AdminReview = {
  id: string;
  product: string;
  productId?: string;
  customer: string;
  rating: number;
  text: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
};

export type AdminSettings = {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber?: string;
  supportAddress?: string;
  contactIntro?: string;
  deliveryFee: number;
  freeShippingAt: number;
  codEnabled: boolean;
  whatsappAlerts: boolean;
  lowStockEmail: boolean;
  maintenanceMode: boolean;
};

export const defaultAdminSettings: AdminSettings = {
  storeName: "Rida Boutique",
  supportPhone: "+91 70060 11492",
  supportEmail: "support@ridaboutique.in",
  whatsappNumber: "+91 70060 11492",
  supportAddress: "Delivery across Kashmir",
  contactIntro: "Order support, custom order help, returns, collaborations, and WhatsApp assistance.",
  deliveryFee: 120,
  freeShippingAt: 4999,
  codEnabled: true,
  whatsappAlerts: true,
  lowStockEmail: true,
  maintenanceMode: false
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCategory(value: string): ProductCategory {
  const slug = slugify(value);
  const categories: ProductCategory[] = [
    "womens-fashion",
    "custom-earrings",
    "custom-frames",
    "cash-bouquets",
    "custom-gifts",
    "hijabs",
    "accessories"
  ];

  return categories.includes(slug as ProductCategory) ? (slug as ProductCategory) : "custom-gifts";
}

function toStockStatus(value: string): StockStatus {
  const statuses: StockStatus[] = ["In stock", "Low stock", "Made to order", "Sold out"];
  return statuses.includes(value as StockStatus) ? (value as StockStatus) : "In stock";
}

function productSlug(name: string, id: string) {
  return slugify(name) || id;
}

export function storedProductToProduct(product: StoredAdminProduct): Product {
  const tags = product.tags
    ? product.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];
  const mainImage = product.image || product.thumbnail || fallbackProducts[0]?.image || "";
  const thumbnail = product.thumbnail || mainImage;

  return {
    id: product.id,
    slug: productSlug(product.name, product.id),
    name: product.name,
    category: toCategory(product.category),
    collection: product.collection || "new-arrivals",
    price: Number(product.price) || 0,
    originalPrice: product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : undefined,
    currency: "INR",
    image: thumbnail,
    hoverImage: mainImage,
    images: [mainImage],
    description: product.description || "Product details are managed from the admin panel.",
    details: [
      product.sku ? `SKU: ${product.sku}` : "Admin-managed product",
      product.returnEligible ? "Return eligible under standard policy" : "Custom item: no returns",
      "Inventory and pricing controlled from admin"
    ],
    tags,
    rating: 0,
    reviewCount: 0,
    stockStatus: toStockStatus(product.stockStatus),
    stock: Number(product.stock) || 0,
    isNew: product.collection === "new-arrivals",
    isBestSeller: product.collection === "best-sellers",
    isFeatured: product.featured,
    returnEligible: Boolean(product.returnEligible)
  };
}

export function getAdminProducts(fallback: Product[] = fallbackProducts) {
  const storedProducts = readJson<StoredAdminProduct[]>(ADMIN_PRODUCTS_KEY, []);
  const adminProducts = storedProducts
    .filter((product) => product.published !== false)
    .map(storedProductToProduct);

  return adminProducts.length ? adminProducts : fallback;
}

export function getAdminReviews() {
  return readJson<AdminReview[]>(ADMIN_REVIEWS_KEY, []);
}

export function getApprovedProductReviews(product: Product) {
  return getAdminReviews().filter(
    (review) =>
      review.status === "Approved" &&
      (review.productId === product.id || review.product === product.name)
  );
}

export function getProductRating(product: Product) {
  const reviews = getApprovedProductReviews(product);

  if (!reviews.length) {
    return { rating: product.rating, count: product.reviewCount };
  }

  const rating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return { rating, count: reviews.length };
}

export function saveAdminReview(review: AdminReview) {
  const reviews = getAdminReviews();
  window.localStorage.setItem(ADMIN_REVIEWS_KEY, JSON.stringify([review, ...reviews]));
  window.dispatchEvent(new CustomEvent("rida-admin-storage", { detail: { key: ADMIN_REVIEWS_KEY } }));
}

export function getAdminSettings() {
  return {
    ...defaultAdminSettings,
    ...readJson<Partial<AdminSettings>>(ADMIN_SETTINGS_KEY, {})
  };
}

export function useAdminProducts(fallback: Product[]) {
  const [items, setItems] = useState<Product[]>(fallback);

  useEffect(() => {
    function load() {
      setItems(getAdminProducts(fallback));
    }

    load();
    window.addEventListener("storage", load);
    window.addEventListener("rida-admin-storage", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("rida-admin-storage", load);
    };
  }, [fallback]);

  return items;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState(defaultAdminSettings);

  useEffect(() => {
    function load() {
      setSettings(getAdminSettings());
    }

    load();
    window.addEventListener("storage", load);
    window.addEventListener("rida-admin-storage", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("rida-admin-storage", load);
    };
  }, []);

  return settings;
}

export function useProductRating(product: Product) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    function refresh() {
      setVersion((current) => current + 1);
    }

    window.addEventListener("storage", refresh);
    window.addEventListener("rida-admin-storage", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("rida-admin-storage", refresh);
    };
  }, []);

  return useMemo(() => getProductRating(product), [product, version]);
}
