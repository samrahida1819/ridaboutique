"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, ImagePlus, Save, Trash2, Upload } from "lucide-react";
import {
  AdminNotice,
  bannerDraftFromRow,
  BannerDraft,
  emptyBannerDraft,
  PageHeader
} from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api-client";

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Array<Record<string, unknown>>>([]);
  const [editingBannerId, setEditingBannerId] = useState("");
  const [form, setForm] = useState<BannerDraft>(emptyBannerDraft);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await adminFetch<{ banners: Array<Record<string, unknown>> }>("/api/admin/banners");
      setBanners(data.banners || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Banners load failed.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetBannerForm() {
    setEditingBannerId("");
    setForm(emptyBannerDraft);
  }

  function editBanner(banner: Record<string, unknown>) {
    setEditingBannerId(String(banner.id));
    setForm(bannerDraftFromRow(banner));
    setMessage("");
  }

  async function saveBanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      active: form.active,
      imageUrl: form.imageUrl || "",
      linkUrl: form.linkUrl || "",
      sortOrder: Number(form.sortOrder || 0),
      subtitle: form.subtitle || null,
      title: form.title,
    };

    try {
      await adminFetch(editingBannerId ? `/api/admin/banners/${editingBannerId}` : "/api/admin/banners", {
        body: payload,
        method: editingBannerId ? "PATCH" : "POST"
      });
      setMessage(editingBannerId ? "Banner updated." : "Banner added.");
      resetBannerForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Banner save failed.");
    }

    await load();
  }

  async function toggleBanner(banner: Record<string, unknown>) {
    try {
      await adminFetch(`/api/admin/banners/${String(banner.id)}`, {
        body: {
          ...bannerDraftFromRow(banner),
          active: banner.active === false
        },
        method: "PATCH"
      });
      setMessage("Banner visibility updated.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Banner update failed.");
    }
  }

  async function deleteBanner(id: string) {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await adminFetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      setMessage("Banner deleted.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Banner delete failed.");
    }
  }

  async function handleBannerImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("Uploading banner image...");
    try {
      const uploadForm = new FormData();
      uploadForm.append("files", file);
      const { urls } = await adminFetch<{ urls: string[] }>("/api/admin/uploads", {
        body: uploadForm,
        method: "POST"
      });
      if (urls[0]) {
        setForm((current) => ({ ...current, imageUrl: urls[0] }));
        setMessage("Banner image uploaded.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Banner upload failed.");
    }
    event.target.value = "";
  }

  return (
    <>
      <PageHeader description="Manage the marketing banner shown on the homepage after the trust strip." title="Banners" />
      {message ? <AdminNotice message={message} /> : null}
      <form className="mb-5 grid gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900" onSubmit={saveBanner}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" required />
          <Input value={form.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Subtitle" />
          <Input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Image URL" />
          <Input value={form.linkUrl} onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))} placeholder="Link URL" />
          <Input inputMode="numeric" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} placeholder="Sort order" />
        </div>
        <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-dashed border-stone-300 p-4 text-sm dark:border-neutral-700">
          <span className="flex items-center gap-2 font-medium">
            <Upload className="size-4" />
            Upload banner image
          </span>
          <span className="text-xs text-stone-500">
            Recommended: wide landscape 16:9 (1600x900px, ideally 1920x1080px). Use JPG, PNG, or WebP under 2MB. Keep important text/subjects centered.
          </span>
          <input accept="image/*" className="sr-only" onChange={(event) => void handleBannerImageUpload(event)} type="file" />
        </label>
        <label className="flex items-center gap-2 text-sm"><input checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} type="checkbox" /> Active</label>
        <div className="flex flex-wrap gap-2">
          <Button className="w-fit" type="submit">
            {editingBannerId ? <Save className="size-4" /> : <ImagePlus className="size-4" />}
            {editingBannerId ? "Save banner" : "Add banner"}
          </Button>
          {editingBannerId ? <Button onClick={resetBannerForm} type="button" variant="outline">Cancel edit</Button> : null}
        </div>
      </form>
      <div className="grid gap-3">
        {banners.map((banner) => (
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900" key={String(banner.id)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {banner.image_url ? (
                  <img
                    alt=""
                    className="h-24 w-36 rounded-md object-cover"
                    src={String(banner.image_url)}
                  />
                ) : null}
                <div>
                <p className="font-medium">{String(banner.title || "-")}</p>
                <p className="text-sm text-stone-500">{String(banner.subtitle || "")}</p>
                {banner.link_url ? <p className="mt-1 text-xs text-stone-500">{String(banner.link_url)}</p> : null}
                <p className="mt-1 text-xs text-stone-500">Sort: {String(banner.sort_order || 0)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-stone-200 px-2 py-1 text-xs dark:border-neutral-700">
                  {banner.active === false ? "Inactive" : "Active"}
                </span>
                <Button onClick={() => editBanner(banner)} size="sm" variant="outline"><Edit className="size-3" />Edit</Button>
                <Button onClick={() => void toggleBanner(banner)} size="sm" variant="outline">
                  {banner.active === false ? "Show" : "Hide"}
                </Button>
                <Button onClick={() => void deleteBanner(String(banner.id))} size="sm" variant="outline"><Trash2 className="size-3" />Delete</Button>
              </div>
            </div>
          </div>
        ))}
        {!banners.length ? <AdminNotice message="No banners yet." /> : null}
      </div>
    </>
  );
}
