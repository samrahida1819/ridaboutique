"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, ExternalLink, Plus, Trash2 } from "lucide-react";
import { AdminNotice, PageHeader, selectClassName } from "@/components/admin/shared";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api-client";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

export function AdminProductsPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [updatingId, setUpdatingId] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter === "active" && product.isActive === false) return false;
      if (statusFilter === "inactive" && product.isActive !== false) return false;
      if (!query) return true;
      const haystack = [product.name, product.slug, product.categoryName, product.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [products, searchQuery, statusFilter]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ products: Product[] }>("/api/admin/products");
      setProducts(data.products || []);
      setError("");
    } catch (nextError) {
      setProducts([]);
      setError(nextError instanceof Error ? nextError.message : "Products load failed.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function deleteProduct(id: string) {
    if (!window.confirm("Delete this product?")) return;
    setMessage("");
    try {
      await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setMessage("Product deleted.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product delete failed.");
    }
  }

  async function updateProductFlags(product: Product, next: { active?: boolean; featured?: boolean }) {
    setUpdatingId(product.id);
    setMessage("");

    try {
      await adminFetch(`/api/admin/products/${product.id}`, {
        body: {
          active: next.active ?? (product.isActive !== false),
          categoryId: product.categoryId || null,
          description: product.description,
          featured: next.featured ?? Boolean(product.isFeatured),
          imageUrls: product.images,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice ?? null,
          slug: product.slug,
          stock: product.stock
        },
        method: "PATCH"
      });
      setMessage("Product updated.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product update failed.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <>
      <PageHeader
        action={<ButtonLink href="/dashboard/products/new"><Plus className="size-4" />Add Product</ButtonLink>}
        description="Add, edit, delete, upload images, and manage product status."
        title="Products"
      />
      {error ? <AdminNotice message={`Showing fallback catalog because Supabase returned: ${error}`} /> : null}
      {message ? <AdminNotice message={message} /> : null}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          className="max-w-md"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name, slug, or category"
          value={searchQuery}
        />
        <select
          className={selectClassName}
          onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
          value={statusFilter}
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>
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
            ) : filteredProducts.length ? filteredProducts.map((product) => (
              <tr className="border-t border-stone-200 dark:border-neutral-800" key={product.id}>
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4">{product.categoryName || product.category}</td>
                <td className="p-4">{formatCurrency(product.salePrice || product.price)}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-stone-200 px-2 py-1 text-xs dark:border-neutral-700">
                      {product.isActive === false ? "Inactive" : "Active"}
                    </span>
                    {product.isFeatured ? (
                      <span className="rounded-full border border-stone-200 px-2 py-1 text-xs dark:border-neutral-700">Featured</span>
                    ) : null}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink href={`/dashboard/products/${product.id}`} size="sm" variant="outline"><Edit className="size-3" />Edit</ButtonLink>
                    <ButtonLink href={`/products/${product.slug}`} rel="noreferrer" size="sm" target="_blank" variant="outline"><ExternalLink className="size-3" />View</ButtonLink>
                    <Button
                      disabled={updatingId === product.id}
                      onClick={() => void updateProductFlags(product, { active: product.isActive === false })}
                      size="sm"
                      variant="outline"
                    >
                      {product.isActive === false ? "Show" : "Hide"}
                    </Button>
                    <Button
                      disabled={updatingId === product.id}
                      onClick={() => void updateProductFlags(product, { featured: !product.isFeatured })}
                      size="sm"
                      variant="outline"
                    >
                      {product.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button onClick={() => void deleteProduct(product.id)} size="sm" variant="outline"><Trash2 className="size-3" />Delete</Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td className="p-8 text-center text-stone-500" colSpan={6}>No products match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
