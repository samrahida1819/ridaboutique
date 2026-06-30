"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Save, Trash2 } from "lucide-react";
import { AdminNotice, PageHeader, slugify } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api-client";
import type { Category } from "@/types/commerce";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDraft, setCategoryDraft] = useState({ active: true, description: "", name: "", slug: "" });
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ categories: Category[] }>("/api/admin/categories");
      setCategories(data.categories || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Categories load failed.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await adminFetch("/api/admin/categories", {
        body: {
          active: true,
          description,
          name,
          slug: slugify(name)
        },
        method: "POST"
      });
      setMessage("Category added.");
      setName("");
      setDescription("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Category add failed.");
    }
  }

  function editCategory(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryDraft({
      active: category.active !== false,
      description: category.description || "",
      name: category.name,
      slug: category.slug
    });
    setMessage("");
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await adminFetch(`/api/admin/categories/${editingCategoryId}`, {
        body: {
          active: categoryDraft.active,
          description: categoryDraft.description,
          name: categoryDraft.name,
          slug: categoryDraft.slug || slugify(categoryDraft.name)
        },
        method: "PATCH"
      });
      setMessage("Category updated.");
      setEditingCategoryId("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Category update failed.");
    }
  }

  async function toggleCategory(category: Category) {
    try {
      await adminFetch(`/api/admin/categories/${category.id}`, {
        body: {
          active: category.active === false,
          description: category.description || "",
          name: category.name,
          slug: category.slug
        },
        method: "PATCH"
      });
      setMessage("Category visibility updated.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Category update failed.");
    }
  }

  async function deleteCategory(id: string) {
    if (!window.confirm("Delete this category? Products using it will keep working without the category.")) return;
    try {
      await adminFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      setMessage("Category deleted.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Category delete failed.");
    }
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
      {editingCategoryId ? (
        <form
          className="mb-5 grid gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2"
          onSubmit={saveCategory}
        >
          <Field label="Category name">
            <Input
              value={categoryDraft.name}
              onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </Field>
          <Field label="Slug">
            <Input
              value={categoryDraft.slug}
              onChange={(event) => setCategoryDraft((current) => ({ ...current, slug: event.target.value }))}
            />
          </Field>
          <Field label="Description">
            <Input
              value={categoryDraft.description}
              onChange={(event) => setCategoryDraft((current) => ({ ...current, description: event.target.value }))}
            />
          </Field>
          <label className="flex items-center gap-2 self-end rounded-md border border-stone-200 px-3 py-3 text-sm dark:border-neutral-700">
            <input
              checked={categoryDraft.active}
              onChange={(event) => setCategoryDraft((current) => ({ ...current, active: event.target.checked }))}
              type="checkbox"
            />
            Show on storefront
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit"><Save className="size-4" />Save category</Button>
            <Button onClick={() => setEditingCategoryId("")} type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      ) : null}
      <div className="grid gap-3">
        {loading ? <AdminNotice message="Loading categories..." /> : null}
        {categories.map((category) => (
          <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between" key={category.id}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{category.name}</p>
                <span className="rounded-full border border-stone-200 px-2 py-1 text-xs dark:border-neutral-700">
                  {category.active === false ? "Hidden" : "Visible"}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">{category.slug}</p>
              {category.description ? <p className="mt-1 text-xs text-stone-500">{category.description}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => editCategory(category)} size="sm" variant="outline"><Edit className="size-3" />Edit</Button>
              <Button onClick={() => void toggleCategory(category)} size="sm" variant="outline">
                {category.active === false ? "Show" : "Hide"}
              </Button>
              <Button onClick={() => void deleteCategory(category.id)} size="sm" variant="outline"><Trash2 className="size-3" />Delete</Button>
            </div>
          </div>
        ))}
        {!loading && !categories.length ? <AdminNotice message="No categories yet." /> : null}
      </div>
    </>
  );
}
