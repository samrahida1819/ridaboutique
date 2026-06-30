"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Save, Trash2, Upload } from "lucide-react";
import { AdminNotice, PageHeader, slugify } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api-client";
import type { Category, Product } from "@/types/commerce";

export function AdminProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
  const imageUrls = useMemo(
    () => form.imageUrls.split("\n").map((url) => url.trim()).filter(Boolean),
    [form.imageUrls]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const categoryResult = await adminFetch<{ categories: Category[] }>("/api/admin/categories");
        setCategories((categoryResult.categories || []).map((category) => ({
          id: String(category.id),
          name: String(category.name),
          slug: String(category.slug),
          description: category.description,
          active: category.active !== false
        })));

        if (productId) {
          const { product } = await adminFetch<{ product: Product }>(`/api/admin/products/${productId}`);
          if (product) {
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
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Product editor failed to load.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [productId]);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function removeImage(url: string) {
    setForm((current) => ({
      ...current,
      imageUrls: current.imageUrls
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item && item !== url)
        .join("\n")
    }));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setMessage("Uploading image...");
    try {
      const uploadForm = new FormData();
      files.forEach((file) => uploadForm.append("files", file));
      const { urls } = await adminFetch<{ urls: string[] }>("/api/admin/uploads", {
        body: uploadForm,
        method: "POST"
      });
      setForm((current) => ({
        ...current,
        imageUrls: [current.imageUrls, ...urls].filter(Boolean).join("\n")
      }));
      setMessage(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded.`);
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
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      categoryId: form.categoryId || null,
      stock: Number(form.stock || 0),
      description: form.description,
      imageUrls: form.imageUrls.split("\n").map((url) => url.trim()).filter(Boolean),
      featured: form.featured,
      active: form.active
    };

    try {
      await adminFetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        body: payload,
        method: productId ? "PATCH" : "POST"
      });
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Product save failed.");
      return;
    }

    setSaving(false);
    router.push("/admin/products");
  }

  return (
    <>
      <PageHeader
        description="Use Supabase Storage for image uploads. Product image URLs are saved on the product row."
        title={productId ? "Edit Product" : "Add Product"}
      />
      {message ? <AdminNotice message={message} /> : null}
      {loading ? <AdminNotice message="Loading product editor..." /> : null}
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
        {imageUrls.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {imageUrls.map((url) => (
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-50 dark:border-neutral-800 dark:bg-neutral-950" key={url}>
                <div className="aspect-[4/3] bg-stone-100 dark:bg-neutral-900">
                  <img alt="Product preview" className="h-full w-full object-cover" src={url} />
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-stone-500">{url}</span>
                  <Button onClick={() => removeImage(url)} size="sm" type="button" variant="ghost">
                    <Trash2 className="size-3" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-dashed border-stone-300 p-4 text-sm dark:border-neutral-700">
          <span className="flex items-center gap-2 font-medium">
            <Upload className="size-4" />
            Upload product images
          </span>
          <span className="text-xs text-stone-500">
            Recommended: square 1:1 (1000x1000px, ideally 1200x1200px). Use JPG, PNG, or WebP under 2MB. First image is the main photo.
          </span>
          <input accept="image/*" className="sr-only" multiple onChange={(event) => void handleFileChange(event)} type="file" />
        </label>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input checked={form.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" /> Featured</label>
          <label className="flex items-center gap-2"><input checked={form.active} onChange={(event) => update("active", event.target.checked)} type="checkbox" /> Active</label>
        </div>
        <Button className="w-fit" disabled={saving || loading} type="submit"><Save className="size-4" />{saving ? "Saving..." : "Save product"}</Button>
      </form>
    </>
  );
}
