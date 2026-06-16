"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, ImagePlus, Plus, RefreshCcw, Save, Trash2, Upload } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import {
  fallbackContactDetails,
  fallbackSettings,
  fallbackWebsiteContent,
  normalizeProduct
} from "@/data/store";
import { useCatalog, useContactDetails, useStoreSettings, useWebsiteContent } from "@/hooks/use-store-data";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Category, ContactDetails, Product, StoreSettings, WebsiteContentKey } from "@/types/commerce";

const orderStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
const contentKeys: WebsiteContentKey[] = ["about", "faq", "privacy", "terms", "shipping", "returns"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function PageHeader({
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

function AdminNotice({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-stone-300">
      {message}
    </div>
  );
}

export function AdminDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<Array<Record<string, unknown>>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    if (!hasSupabaseConfig()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const [orders, pending, products, customers, recent] = await Promise.all([
      supabase.from("orders").select("total", { count: "exact" }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("orders").select("order_number, full_name, total, status, created_at").order("created_at", { ascending: false }).limit(6)
    ]);

    const revenue = (orders.data || []).reduce((sum, order) => sum + Number(order.total || 0), 0);
    setMetrics({
      totalOrders: orders.count || orders.data?.length || 0,
      pendingOrders: pending.count || 0,
      totalProducts: products.count || 0,
      totalCustomers: customers.count || 0,
      totalRevenue: revenue
    });
    setRecentOrders(recent.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = [
    ["Total Orders", metrics.totalOrders.toString()],
    ["Pending Orders", metrics.pendingOrders.toString()],
    ["Total Products", metrics.totalProducts.toString()],
    ["Total Customers", metrics.totalCustomers.toString()],
    ["Total Revenue", formatCurrency(metrics.totalRevenue)]
  ];

  return (
    <>
      <PageHeader
        action={<Button onClick={() => void load()} variant="outline"><RefreshCcw className="size-4" />Refresh</Button>}
        description="Simple store overview from Supabase."
        title="Dashboard"
      />
      {!hasSupabaseConfig() ? <AdminNotice message="Supabase env is missing. Add env vars before using live admin data." /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" key={label}>
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{loading ? "..." : value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-stone-200 p-4 dark:border-neutral-800">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length ? recentOrders.map((order) => (
                <tr className="border-t border-stone-200 dark:border-neutral-800" key={String(order.order_number || order.created_at)}>
                  <td className="p-4">{String(order.order_number || "-")}</td>
                  <td className="p-4">{String(order.full_name || "-")}</td>
                  <td className="p-4">{String(order.status || "-")}</td>
                  <td className="p-4">{formatCurrency(Number(order.total || 0))}</td>
                  <td className="p-4">{order.created_at ? formatDate(String(order.created_at)) : "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td className="p-8 text-center text-stone-500" colSpan={5}>No recent orders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function AdminProductsPage() {
  const { error, loading, products, refresh } = useCatalog(false);
  const [message, setMessage] = useState("");

  async function deleteProduct(id: string) {
    if (!window.confirm("Delete this product?")) return;
    setMessage("");
    const { error: deleteError } = await getSupabaseBrowserClient().from("products").delete().eq("id", id);
    setMessage(deleteError ? deleteError.message : "Product deleted.");
    await refresh();
  }

  return (
    <>
      <PageHeader
        action={<ButtonLink href="/admin/products/new"><Plus className="size-4" />Add Product</ButtonLink>}
        description="Add, edit, delete, upload images, and manage product status."
        title="Products"
      />
      {error ? <AdminNotice message={`Showing fallback catalog because Supabase returned: ${error}`} /> : null}
      {message ? <AdminNotice message={message} /> : null}
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-stone-500">
            <tr>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-8 text-center text-stone-500" colSpan={6}>Loading products...</td></tr>
            ) : products.map((product) => (
              <tr className="border-t border-stone-200 dark:border-neutral-800" key={product.id}>
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4">{product.categoryName || product.category}</td>
                <td className="p-4">{formatCurrency(product.salePrice || product.price)}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">{product.isActive === false ? "Inactive" : "Active"}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <ButtonLink href={`/admin/products/${product.id}`} size="sm" variant="outline"><Edit className="size-3" />Edit</ButtonLink>
                    <Button onClick={() => void deleteProduct(product.id)} size="sm" variant="outline"><Trash2 className="size-3" />Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "0",
    salePrice: "",
    categoryId: "",
    stock: "0",
    description: "",
    imageUrls: "",
    featured: false,
    active: true
  });

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const categoryResult = await supabase.from("categories").select("id, name, slug, description, active").order("name");
      setCategories((categoryResult.data || []).map((category) => ({
        id: String(category.id),
        name: String(category.name),
        slug: String(category.slug),
        description: category.description,
        active: category.active !== false
      })));

      if (productId) {
        const { data } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
        if (data) {
          const product = normalizeProduct(data);
          setForm({
            name: product.name,
            slug: product.slug,
            price: String(product.price),
            salePrice: product.salePrice ? String(product.salePrice) : "",
            categoryId: product.categoryId || "",
            stock: String(product.stock),
            description: product.description,
            imageUrls: product.images.join("\n"),
            featured: Boolean(product.isFeatured),
            active: product.isActive !== false
          });
        }
      }
    }

    void load();
  }, [productId]);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadImage(file: File) {
    const path = `products/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) throw error;
    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setMessage("Uploading image...");
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setForm((current) => ({
        ...current,
        imageUrls: [current.imageUrls, ...urls].filter(Boolean).join("\n")
      }));
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      price: Number(form.price || 0),
      sale_price: form.salePrice ? Number(form.salePrice) : null,
      category_id: form.categoryId || null,
      stock: Number(form.stock || 0),
      description: form.description,
      image_urls: form.imageUrls.split("\n").map((url) => url.trim()).filter(Boolean),
      featured: form.featured,
      active: form.active
    };

    const supabase = getSupabaseBrowserClient();
    const result = productId
      ? await supabase.from("products").update(payload).eq("id", productId)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    router.push("/admin/products");
  }

  return (
    <>
      <PageHeader
        description="Use Supabase Storage for image uploads. Product image URLs are saved on the product row."
        title={productId ? "Edit Product" : "Add Product"}
      />
      {message ? <AdminNotice message={message} /> : null}
      <form className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Product name"><Input value={form.name} onChange={(event) => update("name", event.target.value)} required /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="auto-generated if empty" /></Field>
          <Field label="Price"><Input inputMode="decimal" value={form.price} onChange={(event) => update("price", event.target.value)} required /></Field>
          <Field label="Sale price"><Input inputMode="decimal" value={form.salePrice} onChange={(event) => update("salePrice", event.target.value)} /></Field>
          <Field label="Category">
            <select className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950" value={form.categoryId} onChange={(event) => update("categoryId", event.target.value)}>
              <option value="">No category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="Stock"><Input inputMode="numeric" value={form.stock} onChange={(event) => update("stock", event.target.value)} /></Field>
        </div>
        <Field label="Description"><Textarea value={form.description} onChange={(event) => update("description", event.target.value)} /></Field>
        <Field label="Product images">
          <Textarea value={form.imageUrls} onChange={(event) => update("imageUrls", event.target.value)} placeholder="One image URL per line" />
        </Field>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-stone-300 p-4 text-sm dark:border-neutral-700">
          <Upload className="size-4" />
          Upload product images
          <input accept="image/*" className="sr-only" multiple onChange={(event) => void handleFileChange(event)} type="file" />
        </label>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input checked={form.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" /> Featured</label>
          <label className="flex items-center gap-2"><input checked={form.active} onChange={(event) => update("active", event.target.checked)} type="checkbox" /> Active</label>
        </div>
        <Button className="w-fit" disabled={saving} type="submit"><Save className="size-4" />{saving ? "Saving..." : "Save product"}</Button>
      </form>
    </>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getSupabaseBrowserClient().from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(orderId: string, status: string) {
    await getSupabaseBrowserClient().from("orders").update({ status }).eq("id", orderId);
    await load();
  }

  return (
    <>
      <PageHeader description="View all orders and update fulfillment status." title="Orders" />
      <div className="grid gap-4">
        {loading ? <AdminNotice message="Loading orders..." /> : null}
        {orders.map((order) => (
          <article className="rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" key={String(order.id)}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold">{String(order.order_number || order.id)}</p>
                <p className="mt-1 text-sm text-stone-500">{String(order.full_name || "-")} - {String(order.phone || "-")}</p>
                <p className="mt-1 text-sm text-stone-500">{order.created_at ? formatDate(String(order.created_at)) : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950" value={String(order.status || "Pending")} onChange={(event) => void updateStatus(String(order.id), event.target.value)}>
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <span className="font-semibold">{formatCurrency(Number(order.total || 0))}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-stone-600 dark:text-stone-300">
              {Array.isArray(order.order_items) && order.order_items.length ? order.order_items.map((item: Record<string, unknown>) => (
                <div className="flex justify-between gap-3" key={String(item.id || item.product_name)}>
                  <span>{String(item.product_name || "Product")} x {String(item.quantity || 1)}</span>
                  <span>{formatCurrency(Number(item.total || 0))}</span>
                </div>
              )) : <span>No order items.</span>}
            </div>
          </article>
        ))}
        {!loading && !orders.length ? <AdminNotice message="No orders yet." /> : null}
      </div>
    </>
  );
}

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    async function load() {
      const { data } = await getSupabaseBrowserClient().from("profiles").select("id, full_name, email, phone, address, created_at").eq("role", "customer").order("created_at", { ascending: false });
      setCustomers(data || []);
    }
    void load();
  }, []);

  return (
    <>
      <PageHeader description="Customer profile records from Supabase Auth profiles." title="Customers" />
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-stone-500"><tr><th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Phone</th><th className="p-4 font-medium">Address</th><th className="p-4 font-medium">Joined</th></tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr className="border-t border-stone-200 dark:border-neutral-800" key={String(customer.id)}>
                <td className="p-4">{String(customer.full_name || "-")}</td>
                <td className="p-4">{String(customer.email || "-")}</td>
                <td className="p-4">{String(customer.phone || "-")}</td>
                <td className="p-4">{String(customer.address || "-")}</td>
                <td className="p-4">{customer.created_at ? formatDate(String(customer.created_at)) : "-"}</td>
              </tr>
            ))}
            {!customers.length ? <tr><td className="p-8 text-center text-stone-500" colSpan={5}>No customers yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminCategoriesPage() {
  const { categories, refresh } = useCatalog(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await getSupabaseBrowserClient().from("categories").insert({
      name,
      slug: slugify(name),
      description,
      active: true
    });
    setMessage(error ? error.message : "Category added.");
    setName("");
    setDescription("");
    await refresh();
  }

  async function deleteCategory(id: string) {
    const { error } = await getSupabaseBrowserClient().from("categories").delete().eq("id", id);
    setMessage(error ? error.message : "Category deleted.");
    await refresh();
  }

  return (
    <>
      <PageHeader description="Manage product categories used by the catalog filters." title="Categories" />
      {message ? <AdminNotice message={message} /> : null}
      <form className="mb-5 grid gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-[1fr_1fr_auto]" onSubmit={addCategory}>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" required />
        <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
        <Button type="submit"><Plus className="size-4" />Add</Button>
      </form>
      <div className="grid gap-3">
        {categories.map((category) => (
          <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900" key={category.id}>
            <div><p className="font-medium">{category.name}</p><p className="text-sm text-stone-500">{category.slug}</p></div>
            <Button onClick={() => void deleteCategory(category.id)} size="sm" variant="outline"><Trash2 className="size-3" />Delete</Button>
          </div>
        ))}
      </div>
    </>
  );
}

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", active: true });

  const load = useCallback(async () => {
    const { data } = await getSupabaseBrowserClient()
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setBanners(data || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addBanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await getSupabaseBrowserClient().from("banners").insert({
      title: form.title,
      subtitle: form.subtitle,
      image_url: form.imageUrl,
      link_url: form.linkUrl,
      active: form.active
    });
    setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", active: true });
    await load();
  }

  return (
    <>
      <PageHeader description="Manage the marketing banner shown on the homepage after the trust strip." title="Banners" />
      <form className="mb-5 grid gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900" onSubmit={addBanner}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" required />
          <Input value={form.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Subtitle" />
          <Input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Image URL" />
          <Input value={form.linkUrl} onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))} placeholder="Link URL" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} type="checkbox" /> Active</label>
        <Button className="w-fit" type="submit"><ImagePlus className="size-4" />Add banner</Button>
      </form>
      <div className="grid gap-3">
        {banners.map((banner) => (
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900" key={String(banner.id)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{String(banner.title || "-")}</p>
                <p className="text-sm text-stone-500">{String(banner.subtitle || "")}</p>
                {banner.link_url ? <p className="mt-1 text-xs text-stone-500">{String(banner.link_url)}</p> : null}
              </div>
              <span className="rounded-full border border-stone-200 px-2 py-1 text-xs dark:border-neutral-700">
                {banner.active === false ? "Inactive" : "Active"}
              </span>
            </div>
          </div>
        ))}
        {!banners.length ? <AdminNotice message="No banners yet." /> : null}
      </div>
    </>
  );
}

export function AdminContentPage() {
  const { content } = useWebsiteContent();
  const [draft, setDraft] = useState(fallbackWebsiteContent);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft(content);
  }, [content]);

  async function save() {
    const rows = contentKeys.map((key) => ({
      key,
      title: key,
      body: draft[key]
    }));
    const { error } = await getSupabaseBrowserClient().from("website_content").upsert(rows, { onConflict: "key" });
    setMessage(error ? error.message : "Website content saved.");
  }

  return (
    <>
      <PageHeader description="Update About, FAQ, Privacy, Terms, Shipping, and Return Policy text." title="Website Content" />
      {message ? <AdminNotice message={message} /> : null}
      <div className="grid gap-5">
        {contentKeys.map((key) => (
          <Field key={key} label={key.replace("-", " ")}>
            <Textarea className="min-h-44" value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} />
          </Field>
        ))}
      </div>
      <Button className="mt-5" onClick={() => void save()}><Save className="size-4" />Save content</Button>
    </>
  );
}

export function AdminContactDetailsPage() {
  const { contactDetails } = useContactDetails();
  const [form, setForm] = useState<ContactDetails>(fallbackContactDetails);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm(contactDetails);
  }, [contactDetails]);

  function update(field: keyof ContactDetails, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await getSupabaseBrowserClient().from("contact_details").upsert({
      id: 1,
      store_name: form.storeName,
      email: form.email,
      primary_phone: form.primaryPhone,
      secondary_phone: form.secondaryPhone,
      whatsapp_number: form.whatsappNumber,
      business_address: form.businessAddress,
      google_maps_link: form.googleMapsLink,
      working_hours: form.workingHours,
      instagram_link: form.instagramLink,
      facebook_link: form.facebookLink,
      youtube_link: form.youtubeLink
    });
    setMessage(error ? error.message : "Contact details saved.");
  }

  return (
    <>
      <PageHeader description="These details power the contact page, footer, and WhatsApp button." title="Contact Details" />
      {message ? <AdminNotice message={message} /> : null}
      <form className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2" onSubmit={save}>
        {(Object.keys(form) as Array<keyof ContactDetails>).map((field) => (
          <Field key={field} label={field.replace(/([A-Z])/g, " $1")}>
            <Input value={form[field]} onChange={(event) => update(field, event.target.value)} />
          </Field>
        ))}
        <Button className="w-fit md:col-span-2" type="submit"><Save className="size-4" />Save contact details</Button>
      </form>
    </>
  );
}

export function AdminSettingsPage() {
  const settings = useStoreSettings();
  const [form, setForm] = useState<StoreSettings>(fallbackSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function update(field: keyof StoreSettings, value: string | number | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rows = [
      { key: "store_name", value: form.storeName },
      { key: "logo_url", value: form.logoUrl },
      { key: "delivery_charges", value: Number(form.deliveryCharges || 0) },
      { key: "default_theme", value: form.defaultTheme },
      { key: "instagram_link", value: form.instagramLink },
      { key: "facebook_link", value: form.facebookLink },
      { key: "youtube_link", value: form.youtubeLink }
    ];
    const { error } = await getSupabaseBrowserClient().from("settings").upsert(rows, { onConflict: "key" });
    setMessage(error ? error.message : "Settings saved.");
  }

  return (
    <>
      <PageHeader description="Store name, logo, delivery, default theme, and social links." title="Settings" />
      {message ? <AdminNotice message={message} /> : null}
      <form className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2" onSubmit={save}>
        <Field label="Store name"><Input value={form.storeName} onChange={(event) => update("storeName", event.target.value)} /></Field>
        <Field label="Logo URL"><Input value={form.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} /></Field>
        <Field label="Delivery charges"><Input inputMode="decimal" value={String(form.deliveryCharges)} onChange={(event) => update("deliveryCharges", Number(event.target.value || 0))} /></Field>
        <Field label="Default theme">
          <select className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950" value={form.defaultTheme} onChange={(event) => update("defaultTheme", event.target.value as "light" | "dark")}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
        <Field label="Instagram link"><Input value={form.instagramLink} onChange={(event) => update("instagramLink", event.target.value)} /></Field>
        <Field label="Facebook link"><Input value={form.facebookLink} onChange={(event) => update("facebookLink", event.target.value)} /></Field>
        <Field label="YouTube link"><Input value={form.youtubeLink} onChange={(event) => update("youtubeLink", event.target.value)} /></Field>
        <Button className="w-fit md:col-span-2" type="submit"><Save className="size-4" />Save settings</Button>
      </form>
    </>
  );
}
