import type { ProfileRole, WebsiteContentKey } from "@/types/commerce";

export const orderStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
export const contentKeys: WebsiteContentKey[] = ["about", "faq", "privacy", "terms", "shipping", "returns"];

export type AdminCustomerRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: ProfileRole | null;
  created_at?: string | null;
};

export type CustomerDraft = {
  address: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
  role: ProfileRole;
};

export type BannerDraft = {
  active: boolean;
  imageUrl: string;
  linkUrl: string;
  sortOrder: string;
  subtitle: string;
  title: string;
};

export const emptyBannerDraft: BannerDraft = {
  active: true,
  imageUrl: "",
  linkUrl: "",
  sortOrder: "0",
  subtitle: "",
  title: ""
};

export const selectClassName =
  "h-11 rounded-md border border-stone-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function customerDraftFromRow(customer: AdminCustomerRow): CustomerDraft {
  return {
    address: customer.address || "",
    email: customer.email || "",
    fullName: customer.full_name || "",
    password: "",
    phone: customer.phone || "",
    role: customer.role === "admin" ? "admin" : "customer"
  };
}

export function bannerDraftFromRow(banner: Record<string, unknown>): BannerDraft {
  return {
    active: banner.active !== false,
    imageUrl: String(banner.image_url || ""),
    linkUrl: String(banner.link_url || ""),
    sortOrder: String(banner.sort_order || 0),
    subtitle: String(banner.subtitle || ""),
    title: String(banner.title || "")
  };
}

export function PageHeader({
  action,
  description,
  title
}: {
  action?: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminNotice({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-stone-300">
      {message}
    </div>
  );
}
