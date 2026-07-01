"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fallbackBanners,
  fallbackCategories,
  fallbackContactDetails,
  fallbackSettings,
  fallbackWebsiteContent,
  normalizeProduct,
  products as fallbackProducts
} from "@/data/store";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import type { Banner, Category, ContactDetails, Product, StoreSettings, WebsiteContent, WebsiteContentKey } from "@/types/commerce";

const DATA_LOAD_TIMEOUT_MS = 4000;
const STORE_CONFIG_ERROR =
  "Live store data is unavailable. Add Supabase environment variables on Vercel, then redeploy.";

function useDemoStoreData() {
  return !hasSupabaseConfig() && process.env.NODE_ENV !== "production";
}

function handleMissingSupabaseConfig(setError: (message: string) => void) {
  if (process.env.NODE_ENV === "production") {
    setError(STORE_CONFIG_ERROR);
  }
}

function withTimeout<T>(promise: Promise<T>, label: string) {
  let timeoutId: number;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} timed out.`));
    }, DATA_LOAD_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

type CatalogState = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

type BannerState = {
  banners: Banner[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

export function useCatalog(activeOnly = true): CatalogState {
  const [products, setProducts] = useState<Product[]>(useDemoStoreData() ? fallbackProducts : []);
  const [categories, setCategories] = useState<Category[]>(useDemoStoreData() ? fallbackCategories : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!hasSupabaseConfig()) {
      handleMissingSupabaseConfig(setError);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const [categoryResult, productResult] = await withTimeout(
        Promise.all([
          supabase.from("categories").select("id, name, slug, description, active").order("name"),
          supabase
            .from("products")
            .select("*, categories(id, name, slug)")
            .order("created_at", { ascending: false })
        ]),
        "Catalog load"
      );

      if (categoryResult.error) {
        throw categoryResult.error;
      }
      if (productResult.error) {
        throw productResult.error;
      }

      const nextCategories = (categoryResult.data || []).map((category) => ({
        id: String(category.id),
        name: String(category.name),
        slug: String(category.slug),
        description: category.description,
        active: category.active !== false
      }));

      const nextProducts = (productResult.data || [])
        .filter((row) => !activeOnly || row.active !== false)
        .map((row) => {
          const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
          return normalizeProduct({
            ...row,
            category_name: category?.name,
            category_slug: category?.slug
          });
        });

      // Supabase is configured: show real admin data only (empty stays empty,
      // never silently replace it with the bundled demo catalog).
      setCategories(nextCategories);
      setProducts(nextProducts);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load catalog.");
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, categories, loading, error, refresh: load };
}

export function useBanners(activeOnly = true): BannerState {
  const [banners, setBanners] = useState<Banner[]>(useDemoStoreData() ? fallbackBanners : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!hasSupabaseConfig()) {
      if (useDemoStoreData()) {
        setBanners(fallbackBanners);
      } else {
        handleMissingSupabaseConfig(setError);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let query = getSupabaseBrowserClient()
        .from("banners")
        .select("id, title, subtitle, image_url, link_url, active, sort_order");

      if (activeOnly) {
        query = query.eq("active", true);
      }

      const { data, error: queryError } = await withTimeout(
        Promise.resolve(
          query.order("sort_order", { ascending: true }).order("created_at", { ascending: false })
        ),
        "Banner load"
      );

      if (queryError) {
        throw queryError;
      }

      const nextBanners = (data || []).map((banner) => ({
        id: String(banner.id),
        title: String(banner.title || "Rida Boutique"),
        subtitle: banner.subtitle,
        imageUrl: banner.image_url,
        linkUrl: banner.link_url,
        active: banner.active !== false,
        sortOrder: Number(banner.sort_order || 0)
      }));

      setBanners(nextBanners);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load banners.");
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return { banners, loading, error, refresh: load };
}

export function useContactDetails() {
  const [contactDetails, setContactDetails] = useState<ContactDetails>(fallbackContactDetails);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hasSupabaseConfig()) {
        setLoading(false);
        return;
      }

      const { data } = await getSupabaseBrowserClient()
        .from("contact_details")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (active && data) {
        setContactDetails({
          storeName: data.store_name || fallbackContactDetails.storeName,
          email: data.email || fallbackContactDetails.email,
          primaryPhone: data.primary_phone || fallbackContactDetails.primaryPhone,
          secondaryPhone: data.secondary_phone || fallbackContactDetails.secondaryPhone,
          whatsappNumber: data.whatsapp_number || fallbackContactDetails.whatsappNumber,
          businessAddress: data.business_address || fallbackContactDetails.businessAddress,
          googleMapsLink: data.google_maps_link || fallbackContactDetails.googleMapsLink,
          workingHours: data.working_hours || fallbackContactDetails.workingHours,
          instagramLink: data.instagram_link || fallbackContactDetails.instagramLink,
          facebookLink: data.facebook_link || fallbackContactDetails.facebookLink,
          youtubeLink: data.youtube_link || fallbackContactDetails.youtubeLink
        });
      }

      if (active) {
        setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return { contactDetails, loading };
}

export function useWebsiteContent(key?: WebsiteContentKey) {
  const [content, setContent] = useState<WebsiteContent>(fallbackWebsiteContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hasSupabaseConfig()) {
        setLoading(false);
        return;
      }

      const query = getSupabaseBrowserClient().from("website_content").select("key, body");
      const { data } = key ? await query.eq("key", key) : await query;

      if (active && data) {
        const nextContent = { ...fallbackWebsiteContent };
        data.forEach((item) => {
          if (item.key in nextContent) {
            nextContent[item.key as WebsiteContentKey] = item.body || nextContent[item.key as WebsiteContentKey];
          }
        });
        setContent(nextContent);
      }

      if (active) {
        setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [key]);

  return { content, loading };
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(fallbackSettings);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hasSupabaseConfig()) {
        return;
      }

      const { data } = await getSupabaseBrowserClient().from("settings").select("key, value");
      if (!active || !data) {
        return;
      }

      const next = { ...fallbackSettings };
      data.forEach((item) => {
        const value = item.value as unknown;
        if (item.key === "store_name" && typeof value === "string") next.storeName = value;
        if (item.key === "logo_url" && typeof value === "string") next.logoUrl = value;
        if (item.key === "delivery_charges" && typeof value === "number") next.deliveryCharges = value;
        if (item.key === "default_theme" && (value === "light" || value === "dark")) next.defaultTheme = value;
        if (item.key === "instagram_link" && typeof value === "string") next.instagramLink = value;
        if (item.key === "facebook_link" && typeof value === "string") next.facebookLink = value;
        if (item.key === "youtube_link" && typeof value === "string") next.youtubeLink = value;
      });
      setSettings(next);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return settings;
}
