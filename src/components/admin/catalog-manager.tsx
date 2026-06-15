"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { products } from "@/data/store";
import { cn, formatCurrency } from "@/lib/utils";
import { usePersistentState } from "./use-persistent-state";

type EditableCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

type EditableProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  collection: string;
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  stock: number;
  stockStatus: string;
  description: string;
  image: string;
  thumbnail: string;
  tags: string;
  published: boolean;
  featured: boolean;
  returnEligible: boolean;
};

const inputClass =
  "h-9 w-full rounded border border-[#8c8f94] bg-white px-3 text-sm text-[#1d2327] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]";
const textareaClass =
  "min-h-24 w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-sm text-[#1d2327] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]";

const defaultCategories: EditableCategory[] = [
  { id: "cat-1", name: "Women's Fashion", slug: "womens-fashion", sortOrder: 1, visible: true },
  { id: "cat-2", name: "Custom Earrings", slug: "custom-earrings", sortOrder: 2, visible: true },
  { id: "cat-3", name: "Custom Frames", slug: "custom-frames", sortOrder: 3, visible: true },
  { id: "cat-4", name: "Cash Bouquets", slug: "cash-bouquets", sortOrder: 4, visible: true },
  { id: "cat-5", name: "Custom Gifts", slug: "custom-gifts", sortOrder: 5, visible: true },
  { id: "cat-6", name: "Hijabs", slug: "hijabs", sortOrder: 6, visible: true },
  { id: "cat-7", name: "Accessories", slug: "accessories", sortOrder: 7, visible: true }
];

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDiscount(price: number, compareAtPrice: number) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function getCompareAtPrice(price: number, discountPercent: number) {
  if (!discountPercent) {
    return price;
  }

  return Math.round(price / (1 - discountPercent / 100));
}

const seededProducts: EditableProduct[] = products.map((product, index) => {
  const compareAtPrice = product.originalPrice || getCompareAtPrice(product.price, 14);

  return {
    id: product.id,
    sku: `RIDA-${String(index + 1).padStart(3, "0")}`,
    name: product.name,
    category: titleFromSlug(product.category),
    collection: product.collection,
    price: product.price,
    compareAtPrice,
    discountPercent: getDiscount(product.price, compareAtPrice),
    stock: product.stock,
    stockStatus: product.stockStatus,
    description: product.description,
    image: product.image,
    thumbnail: product.image,
    tags: product.tags.join(", "),
    published: true,
    featured: Boolean(product.isFeatured || product.isBestSeller),
    returnEligible: product.returnEligible
  };
});

const emptyProduct: EditableProduct = {
  id: "",
  sku: "",
  name: "",
  category: defaultCategories[0].name,
  collection: "new-arrivals",
  price: 0,
  compareAtPrice: 0,
  discountPercent: 0,
  stock: 0,
  stockStatus: "In stock",
  description: "",
  image: "",
  thumbnail: "",
  tags: "",
  published: true,
  featured: false,
  returnEligible: true
};

const emptyCategory: EditableCategory = {
  id: "",
  name: "",
  slug: "",
  sortOrder: defaultCategories.length + 1,
  visible: true
};

type StoredInventoryItem = {
  id: string;
  sku: string;
  name: string;
  image: string;
  thumbnail?: string;
  category: string;
  stock: number;
  reserved: number;
  reorderAt: number;
  status: string;
  location: string;
};

export function CatalogManager({ mode = "products" }: { mode?: "products" | "categories" | "all" }) {
  const { toast } = useToast();
  const [catalogProducts, setCatalogProducts] = usePersistentState(
    "rida-admin-products",
    seededProducts
  );
  const [categories, setCategories] = usePersistentState("rida-admin-categories", defaultCategories);
  const [productDraft, setProductDraft] = useState(emptyProduct);
  const [categoryDraft, setCategoryDraft] = useState(emptyCategory);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const visibleProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    return catalogProducts.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.tags.toLowerCase().includes(search);
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && product.published) ||
        (statusFilter === "draft" && !product.published) ||
        (statusFilter === "featured" && product.featured) ||
        (statusFilter === "low-stock" && product.stock <= 5);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [catalogProducts, categoryFilter, productSearch, statusFilter]);

  const visibleCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();

    return categories
      .filter(
        (category) =>
          !search ||
          category.name.toLowerCase().includes(search) ||
          category.slug.toLowerCase().includes(search)
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, categorySearch]);

  function updateProduct<K extends keyof EditableProduct>(key: K, value: EditableProduct[K]) {
    setProductDraft((current) => {
      const next = { ...current, [key]: value };

      if (key === "price") {
        next.price = Number(value) || 0;
        next.compareAtPrice = getCompareAtPrice(next.price, next.discountPercent);
      }

      if (key === "discountPercent") {
        next.discountPercent = Math.min(95, Math.max(0, Number(value) || 0));
        next.compareAtPrice = getCompareAtPrice(next.price, next.discountPercent);
      }

      if (key === "compareAtPrice") {
        next.compareAtPrice = Number(value) || 0;
        next.discountPercent = getDiscount(next.price, next.compareAtPrice);
      }

      if (key === "stock") {
        next.stock = Number(value) || 0;
      }

      return next;
    });
  }

  function useMainImageAsThumbnail() {
    updateProduct("thumbnail", productDraft.image);
    toast({ title: "Thumbnail copied from main image" });
  }

  function loadManualThumbnail(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ kind: "info", title: "Choose an image file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProduct("thumbnail", String(reader.result || ""));
      toast({ title: "Thumbnail added", description: file.name });
    };
    reader.onerror = () => {
      toast({ kind: "info", title: "Thumbnail could not be read" });
    };
    reader.readAsDataURL(file);
  }

  function saveProduct() {
    if (!productDraft.name.trim()) {
      toast({ kind: "info", title: "Product name required" });
      return;
    }

    if (!productDraft.price || productDraft.price <= 0) {
      toast({ kind: "info", title: "Product price required" });
      return;
    }

    const nextProduct = {
      ...productDraft,
      id: editingProductId || `prd-admin-${Date.now()}`,
      sku: productDraft.sku || `RIDA-${Date.now().toString().slice(-5)}`
    };

    setCatalogProducts((current) =>
      editingProductId
        ? current.map((product) => (product.id === editingProductId ? nextProduct : product))
        : [nextProduct, ...current]
    );
    setProductDraft(emptyProduct);
    setEditingProductId(null);
    syncInventoryProduct(nextProduct);
    toast({
      title: editingProductId ? "Product updated" : "Product added",
      description: nextProduct.name
    });
  }

  function editProduct(product: EditableProduct) {
    setProductDraft(product);
    setEditingProductId(product.id);
  }

  function duplicateProduct(product: EditableProduct) {
    const copy = {
      ...product,
      id: `prd-admin-${Date.now()}`,
      sku: `${product.sku}-COPY`,
      name: `${product.name} Copy`,
      published: false
    };
    setCatalogProducts((current) => [copy, ...current]);
    syncInventoryProduct(copy);
    toast({ title: "Product duplicated", description: copy.name });
  }

  function deleteProduct(productId: string) {
    const product = catalogProducts.find((item) => item.id === productId);
    setCatalogProducts((current) => current.filter((item) => item.id !== productId));
    setSelectedProductIds((current) => current.filter((id) => id !== productId));
    if (editingProductId === productId) {
      setProductDraft(emptyProduct);
      setEditingProductId(null);
    }
    removeInventoryProduct(productId);
    toast({ title: "Product deleted", description: product?.name });
  }

  function applyProductBulk(action: "publish" | "draft" | "feature" | "unfeature" | "delete") {
    if (!selectedProductIds.length) {
      toast({ kind: "info", title: "Select products first" });
      return;
    }

    if (action === "delete") {
      setCatalogProducts((current) => current.filter((product) => !selectedProductIds.includes(product.id)));
      removeInventoryProducts(selectedProductIds);
      setSelectedProductIds([]);
      toast({ title: "Selected products deleted" });
      return;
    }

    setCatalogProducts((current) =>
      current.map((product) => {
        if (!selectedProductIds.includes(product.id)) {
          return product;
        }

        if (action === "publish") {
          return { ...product, published: true };
        }

        if (action === "draft") {
          return { ...product, published: false };
        }

        return { ...product, featured: action === "feature" };
      })
    );
    toast({ title: "Bulk action applied", description: `${selectedProductIds.length} products updated.` });
  }

  function updateCategory<K extends keyof EditableCategory>(key: K, value: EditableCategory[K]) {
    setCategoryDraft((current) => {
      const next = { ...current, [key]: value };

      if (key === "name" && !editingCategoryId) {
        next.slug = slugify(String(value));
      }

      if (key === "slug") {
        next.slug = slugify(String(value));
      }

      if (key === "sortOrder") {
        next.sortOrder = Number(value) || 1;
      }

      return next;
    });
  }

  function saveCategory() {
    if (!categoryDraft.name.trim()) {
      toast({ kind: "info", title: "Category name required" });
      return;
    }

    const nextCategory = {
      ...categoryDraft,
      slug: categoryDraft.slug || slugify(categoryDraft.name),
      id: editingCategoryId || `cat-admin-${Date.now()}`
    };

    setCategories((current) =>
      editingCategoryId
        ? current.map((category) => (category.id === editingCategoryId ? nextCategory : category))
        : [...current, nextCategory]
    );
    setCategoryDraft({ ...emptyCategory, sortOrder: categories.length + 2 });
    setEditingCategoryId(null);
    toast({
      title: editingCategoryId ? "Category updated" : "Category added",
      description: nextCategory.name
    });
  }

  function editCategory(category: EditableCategory) {
    setCategoryDraft(category);
    setEditingCategoryId(category.id);
  }

  function deleteCategory(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);
    setCategories((current) => current.filter((item) => item.id !== categoryId));
    setSelectedCategoryIds((current) => current.filter((id) => id !== categoryId));
    if (editingCategoryId === categoryId) {
      setCategoryDraft(emptyCategory);
      setEditingCategoryId(null);
    }
    toast({ title: "Category deleted", description: category?.name });
  }

  function applyCategoryBulk(action: "show" | "hide" | "delete") {
    if (!selectedCategoryIds.length) {
      toast({ kind: "info", title: "Select categories first" });
      return;
    }

    if (action === "delete") {
      setCategories((current) => current.filter((category) => !selectedCategoryIds.includes(category.id)));
      setSelectedCategoryIds([]);
      toast({ title: "Selected categories deleted" });
      return;
    }

    setCategories((current) =>
      current.map((category) =>
        selectedCategoryIds.includes(category.id)
          ? { ...category, visible: action === "show" }
          : category
      )
    );
    toast({ title: "Category visibility updated" });
  }

  async function exportProducts() {
    const payload = JSON.stringify(catalogProducts, null, 2);

    if (!navigator.clipboard) {
      toast({ kind: "info", title: "Clipboard not available", description: "Use browser export once hosted." });
      return;
    }

    await navigator.clipboard.writeText(payload);
    toast({ title: "Product export copied", description: `${catalogProducts.length} products copied as JSON.` });
  }

  function toggleProductSelection(productId: string) {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  function toggleCategorySelection(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]
    );
  }

  function readInventoryStorage() {
    try {
      const storedValue = window.localStorage.getItem("rida-admin-inventory");
      return storedValue
        ? (JSON.parse(storedValue) as StoredInventoryItem[])
        : createInventoryFromCatalog(catalogProducts);
    } catch {
      return createInventoryFromCatalog(catalogProducts);
    }
  }

  function createInventoryFromCatalog(items: EditableProduct[]): StoredInventoryItem[] {
    return items.map((product, index) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      image: product.thumbnail || product.image,
      thumbnail: product.thumbnail,
      category: product.category,
      stock: product.stock,
      reserved: index % 3,
      reorderAt: product.stock <= 5 ? 8 : 5,
      status: product.stockStatus,
      location: index % 2 === 0 ? "Srinagar shelf A" : "Srinagar shelf B"
    }));
  }

  function writeInventoryStorage(items: StoredInventoryItem[]) {
    window.localStorage.setItem("rida-admin-inventory", JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent("rida-admin-storage", { detail: { key: "rida-admin-inventory" } })
    );
  }

  function syncInventoryProduct(product: EditableProduct) {
    const items = readInventoryStorage();
    const existing = items.find((item) => item.id === product.id);
    const nextItem: StoredInventoryItem = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      image: product.image,
      category: product.category,
      stock: product.stock,
      reserved: existing?.reserved || 0,
      reorderAt: existing?.reorderAt || (product.stock <= 5 ? 8 : 5),
      status: product.stockStatus,
      location: existing?.location || "Srinagar shelf A"
    };

    writeInventoryStorage(
      existing
        ? items.map((item) => (item.id === product.id ? nextItem : item))
        : [nextItem, ...items]
    );
  }

  function removeInventoryProduct(productId: string) {
    removeInventoryProducts([productId]);
  }

  function removeInventoryProducts(productIds: string[]) {
    writeInventoryStorage(readInventoryStorage().filter((item) => !productIds.includes(item.id)));
  }

  return (
    <div className="grid gap-4">
      {mode === "products" || mode === "all" ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
          <Panel title={editingProductId ? "Edit Product" : "Add Product"}>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded border border-[#dcdcde] bg-[#f6f7f7] p-3">
                <ProductThumbnail
                  name={productDraft.name || "Product"}
                  src={productDraft.thumbnail || productDraft.image}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1d2327]">
                    {productDraft.name || "Product thumbnail"}
                  </p>
                  <p className="mt-1 text-xs text-[#646970]">
                    Manual thumbnail preview for shop cards and admin lists.
                  </p>
                </div>
              </div>
              <Field label="Product name">
                <input
                  className={inputClass}
                  onChange={(event) => updateProduct("name", event.target.value)}
                  value={productDraft.name}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="SKU">
                  <input
                    className={inputClass}
                    onChange={(event) => updateProduct("sku", event.target.value)}
                    value={productDraft.sku}
                  />
                </Field>
                <Field label="Category">
                  <select
                    className={inputClass}
                    onChange={(event) => updateProduct("category", event.target.value)}
                    value={productDraft.category}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Collection">
                <select
                  className={inputClass}
                  onChange={(event) => updateProduct("collection", event.target.value)}
                  value={productDraft.collection}
                >
                  <option value="new-arrivals">New Arrivals</option>
                  <option value="best-sellers">Best Sellers</option>
                  <option value="editor-picks">Editor's Picks</option>
                  <option value="custom-creations">Custom Creations</option>
                </select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Price">
                  <input
                    className={inputClass}
                    min={0}
                    onChange={(event) => updateProduct("price", Number(event.target.value))}
                    type="number"
                    value={productDraft.price || ""}
                  />
                </Field>
                <Field label="Old price">
                  <input
                    className={inputClass}
                    min={0}
                    onChange={(event) => updateProduct("compareAtPrice", Number(event.target.value))}
                    type="number"
                    value={productDraft.compareAtPrice || ""}
                  />
                </Field>
                <Field label="Off %">
                  <input
                    className={inputClass}
                    max={95}
                    min={0}
                    onChange={(event) => updateProduct("discountPercent", Number(event.target.value))}
                    type="number"
                    value={productDraft.discountPercent || ""}
                  />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Stock">
                  <input
                    className={inputClass}
                    min={0}
                    onChange={(event) => updateProduct("stock", Number(event.target.value))}
                    type="number"
                    value={productDraft.stock || ""}
                  />
                </Field>
                <Field label="Stock status">
                  <select
                    className={inputClass}
                    onChange={(event) => updateProduct("stockStatus", event.target.value)}
                    value={productDraft.stockStatus}
                  >
                    <option>In stock</option>
                    <option>Low stock</option>
                    <option>Made to order</option>
                    <option>Sold out</option>
                  </select>
                </Field>
              </div>
              <Field label="Image URL">
                <input
                  className={inputClass}
                  onChange={(event) => updateProduct("image", event.target.value)}
                  value={productDraft.image}
                />
              </Field>
              <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Field label="Manual thumbnail URL">
                      <input
                        className={inputClass}
                        onChange={(event) => updateProduct("thumbnail", event.target.value)}
                        placeholder="Paste thumbnail URL or choose file below"
                        value={productDraft.thumbnail}
                      />
                    </Field>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded border border-[#2271b1] bg-white px-3 text-sm font-medium text-[#2271b1] hover:bg-[#f0f6fc]">
                      <ImagePlus className="size-4" />
                      Choose file
                      <input
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => loadManualThumbnail(event.target.files?.[0])}
                        type="file"
                      />
                    </label>
                    <AdminButton
                      disabled={!productDraft.image}
                      onClick={useMainImageAsThumbnail}
                      variant="secondary"
                    >
                      Use main
                    </AdminButton>
                    <AdminButton
                      disabled={!productDraft.thumbnail}
                      onClick={() => updateProduct("thumbnail", "")}
                      variant="secondary"
                    >
                      Clear
                    </AdminButton>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#646970]">
                  Thumbnail is shown on product cards, admin lists, media previews, and mobile views.
                </p>
              </div>
              <Field label="Tags">
                <input
                  className={inputClass}
                  onChange={(event) => updateProduct("tags", event.target.value)}
                  placeholder="bridal, gift, new"
                  value={productDraft.tags}
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={textareaClass}
                  onChange={(event) => updateProduct("description", event.target.value)}
                  value={productDraft.description}
                />
              </Field>
              <div className="grid gap-2 text-sm text-[#1d2327]">
                <CheckField
                  checked={productDraft.published}
                  label="Published"
                  onChange={(checked) => updateProduct("published", checked)}
                />
                <CheckField
                  checked={productDraft.featured}
                  label="Featured"
                  onChange={(checked) => updateProduct("featured", checked)}
                />
                <CheckField
                  checked={productDraft.returnEligible}
                  label="Return eligible"
                  onChange={(checked) => updateProduct("returnEligible", checked)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminButton onClick={saveProduct}>
                  <Save className="size-4" />
                  {editingProductId ? "Update" : "Add"}
                </AdminButton>
                {editingProductId ? (
                  <AdminButton
                    onClick={() => {
                      setProductDraft(emptyProduct);
                      setEditingProductId(null);
                    }}
                    variant="secondary"
                  >
                    <X className="size-4" />
                    Cancel
                  </AdminButton>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel
            action={
              <AdminButton onClick={exportProducts} variant="secondary">
                <Download className="size-4" />
                Export JSON
              </AdminButton>
            }
            title="Products"
          >
            <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#646970]" />
                <input
                  className={cn(inputClass, "pl-9")}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products, SKU, tags"
                  value={productSearch}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className={inputClass}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  value={categoryFilter}
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  className={inputClass}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  value={statusFilter}
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                  <option value="featured">Featured</option>
                  <option value="low-stock">Low stock</option>
                </select>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <AdminButton onClick={() => applyProductBulk("publish")} variant="secondary">
                <Eye className="size-4" />
                Publish
              </AdminButton>
              <AdminButton onClick={() => applyProductBulk("draft")} variant="secondary">
                <EyeOff className="size-4" />
                Draft
              </AdminButton>
              <AdminButton onClick={() => applyProductBulk("feature")} variant="secondary">
                <CheckCircle2 className="size-4" />
                Feature
              </AdminButton>
              <AdminButton onClick={() => applyProductBulk("delete")} variant="danger">
                <Trash2 className="size-4" />
                Delete
              </AdminButton>
              <span className="text-xs text-[#646970]">{selectedProductIds.length} selected</span>
            </div>

            <div className="grid gap-3 md:hidden">
              {visibleProducts.length ? (
                visibleProducts.map((product) => (
                  <article className="rounded border border-[#c3c4c7] bg-white p-3" key={product.id}>
                    <div className="flex items-start gap-3">
                      <input
                        checked={selectedProductIds.includes(product.id)}
                        className="mt-1"
                        onChange={() => toggleProductSelection(product.id)}
                        type="checkbox"
                      />
                      <ProductThumbnail name={product.name} src={product.thumbnail || product.image} size="lg" />
                      <div className="min-w-0 flex-1">
                        <button
                          className="text-left font-semibold text-[#2271b1] hover:underline"
                          onClick={() => editProduct(product)}
                          type="button"
                        >
                          {product.name}
                        </button>
                        <p className="mt-1 text-xs text-[#646970]">{product.sku} | {product.category}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#1d2327]">
                          <span>{formatCurrency(product.price)}</span>
                          <span className={product.stock <= 5 ? "font-semibold text-[#b32d2e]" : ""}>
                            {product.stock} stock
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <StatusPill tone={product.published ? "green" : "gray"}>
                            {product.published ? "Published" : "Draft"}
                          </StatusPill>
                          {product.featured ? <StatusPill tone="blue">Featured</StatusPill> : null}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1 pl-8">
                      <IconButton label="Edit" onClick={() => editProduct(product)}>
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton label="Duplicate" onClick={() => duplicateProduct(product)}>
                        <Copy className="size-4" />
                      </IconButton>
                      <IconButton label="Delete" onClick={() => deleteProduct(product.id)} variant="danger">
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded border border-[#c3c4c7] bg-white px-3 py-8 text-center text-sm text-[#646970]">
                  No products found.
                </div>
              )}
            </div>

            <div className="hidden overflow-x-auto border border-[#c3c4c7] md:block">
              <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead className="bg-[#f6f7f7] text-[#1d2327]">
                  <tr>
                    <th className="w-10 border-b border-[#c3c4c7] px-3 py-2">
                      <input
                        checked={visibleProducts.length > 0 && selectedProductIds.length === visibleProducts.length}
                        onChange={(event) =>
                          setSelectedProductIds(event.target.checked ? visibleProducts.map((product) => product.id) : [])
                        }
                        type="checkbox"
                      />
                    </th>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Controls</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.length ? (
                    visibleProducts.map((product) => (
                      <tr className="odd:bg-white even:bg-[#f6f7f7]" key={product.id}>
                        <TableCell>
                          <input
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            type="checkbox"
                          />
                        </TableCell>
                        <TableCell>
                          <ProductThumbnail name={product.name} src={product.thumbnail || product.image} />
                        </TableCell>
                        <TableCell>
                          <button
                            className="font-semibold text-[#2271b1] hover:underline"
                            onClick={() => editProduct(product)}
                            type="button"
                          >
                            {product.name}
                          </button>
                          <p className="mt-1 text-xs text-[#646970]">{product.tags || "No tags"}</p>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <span className={product.stock <= 5 ? "font-semibold text-[#b32d2e]" : ""}>
                            {product.stock}
                          </span>
                          <p className="text-xs text-[#646970]">{product.stockStatus}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <StatusPill tone={product.published ? "green" : "gray"}>
                              {product.published ? "Published" : "Draft"}
                            </StatusPill>
                            {product.featured ? <StatusPill tone="blue">Featured</StatusPill> : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <IconButton label="Edit" onClick={() => editProduct(product)}>
                              <Pencil className="size-4" />
                            </IconButton>
                            <IconButton label="Duplicate" onClick={() => duplicateProduct(product)}>
                              <Copy className="size-4" />
                            </IconButton>
                            <IconButton label="Delete" onClick={() => deleteProduct(product.id)} variant="danger">
                              <Trash2 className="size-4" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-10 text-center text-sm text-[#646970]" colSpan={9}>
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>
      ) : null}

      {mode === "categories" || mode === "all" ? (
        <section className="grid gap-4 xl:grid-cols-[340px_1fr]">
          <Panel title={editingCategoryId ? "Edit Category" : "Add Category"}>
            <div className="grid gap-3">
              <Field label="Name">
                <input
                  className={inputClass}
                  onChange={(event) => updateCategory("name", event.target.value)}
                  value={categoryDraft.name}
                />
              </Field>
              <Field label="Slug">
                <input
                  className={inputClass}
                  onChange={(event) => updateCategory("slug", event.target.value)}
                  value={categoryDraft.slug}
                />
              </Field>
              <Field label="Sort order">
                <input
                  className={inputClass}
                  min={1}
                  onChange={(event) => updateCategory("sortOrder", Number(event.target.value))}
                  type="number"
                  value={categoryDraft.sortOrder}
                />
              </Field>
              <CheckField
                checked={categoryDraft.visible}
                label="Visible in shop"
                onChange={(checked) => updateCategory("visible", checked)}
              />
              <div className="flex flex-wrap gap-2">
                <AdminButton onClick={saveCategory}>
                  <Save className="size-4" />
                  {editingCategoryId ? "Update" : "Add"}
                </AdminButton>
                {editingCategoryId ? (
                  <AdminButton
                    onClick={() => {
                      setCategoryDraft(emptyCategory);
                      setEditingCategoryId(null);
                    }}
                    variant="secondary"
                  >
                    <X className="size-4" />
                    Cancel
                  </AdminButton>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel title="Categories">
            <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#646970]" />
                <input
                  className={cn(inputClass, "pl-9")}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder="Search categories"
                  value={categorySearch}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminButton onClick={() => applyCategoryBulk("show")} variant="secondary">
                  <Eye className="size-4" />
                  Show
                </AdminButton>
                <AdminButton onClick={() => applyCategoryBulk("hide")} variant="secondary">
                  <EyeOff className="size-4" />
                  Hide
                </AdminButton>
                <AdminButton onClick={() => applyCategoryBulk("delete")} variant="danger">
                  <Trash2 className="size-4" />
                  Delete
                </AdminButton>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#c3c4c7]">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="bg-[#f6f7f7]">
                  <tr>
                    <th className="w-10 border-b border-[#c3c4c7] px-3 py-2">
                      <input
                        checked={visibleCategories.length > 0 && selectedCategoryIds.length === visibleCategories.length}
                        onChange={(event) =>
                          setSelectedCategoryIds(
                            event.target.checked ? visibleCategories.map((category) => category.id) : []
                          )
                        }
                        type="checkbox"
                      />
                    </th>
                    <TableHead>Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Controls</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {visibleCategories.map((category) => (
                    <tr className="odd:bg-white even:bg-[#f6f7f7]" key={category.id}>
                      <TableCell>
                        <input
                          checked={selectedCategoryIds.includes(category.id)}
                          onChange={() => toggleCategorySelection(category.id)}
                          type="checkbox"
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          className="font-semibold text-[#2271b1] hover:underline"
                          onClick={() => editCategory(category)}
                          type="button"
                        >
                          {category.name}
                        </button>
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell>
                        <StatusPill tone={category.visible ? "green" : "gray"}>
                          {category.visible ? "Visible" : "Hidden"}
                        </StatusPill>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <IconButton label="Edit" onClick={() => editCategory(category)}>
                            <Pencil className="size-4" />
                          </IconButton>
                          <IconButton label="Delete" onClick={() => deleteCategory(category.id)} variant="danger">
                            <Trash2 className="size-4" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  action,
  children
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded border border-[#c3c4c7] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-2 border-b border-[#dcdcde] px-4 py-3 sm:flex-row sm:items-center">
        <h2 className="text-base font-semibold text-[#1d2327]">{title}</h2>
        {action}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

function ProductThumbnail({
  name,
  src,
  size = "sm"
}: {
  name: string;
  src: string;
  size?: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(!src);
  const dimensions = size === "lg" ? "size-16" : "size-12";

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f6f7f7] text-[10px] font-semibold uppercase text-[#646970]",
        dimensions
      )}
    >
      {!failed && src ? (
        <Image
          alt={name}
          className="h-full w-full object-cover"
          height={size === "lg" ? 64 : 48}
          onError={() => setFailed(true)}
          src={src}
          unoptimized
          width={size === "lg" ? 64 : 48}
        />
      ) : (
        <span>{name.slice(0, 2) || "PR"}</span>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#1d2327]">{label}</span>
      {children}
    </label>
  );
}

function CheckField({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#1d2327]">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-[#c3c4c7] px-3 py-2 font-semibold">{children}</th>;
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-[#dcdcde] px-3 py-3 align-top text-[#1d2327]">{children}</td>;
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: "green" | "blue" | "gray" }) {
  const tones = {
    green: "border-[#00a32a]/30 bg-[#edfaef] text-[#008a20]",
    blue: "border-[#2271b1]/30 bg-[#f0f6fc] text-[#135e96]",
    gray: "border-[#c3c4c7] bg-[#f6f7f7] text-[#50575e]"
  };

  return (
    <span className={cn("inline-flex rounded border px-2 py-0.5 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

function AdminButton({
  className,
  variant = "primary",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded border px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" && "border-[#135e96] bg-[#2271b1] text-white hover:bg-[#135e96]",
        variant === "secondary" && "border-[#2271b1] bg-white text-[#2271b1] hover:bg-[#f0f6fc]",
        variant === "danger" && "border-[#b32d2e] bg-white text-[#b32d2e] hover:bg-[#fcf0f1]",
        className
      )}
      type="button"
      {...props}
    />
  );
}

function IconButton({
  children,
  label,
  variant = "secondary",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  label: string;
  variant?: "secondary" | "danger";
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded border transition",
        variant === "secondary" && "border-[#c3c4c7] bg-white text-[#2271b1] hover:bg-[#f0f6fc]",
        variant === "danger" && "border-[#b32d2e]/40 bg-white text-[#b32d2e] hover:bg-[#fcf0f1]"
      )}
      title={label}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
