"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminNotice, PageHeader, selectClassName } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { fallbackSettings } from "@/data/store";
import { useStoreSettings } from "@/hooks/use-store-data";
import { adminFetch } from "@/lib/admin-api-client";
import type { StoreSettings } from "@/types/commerce";

export function AdminSettingsPage() {
  const settings = useStoreSettings();
  const [form, setForm] = useState<StoreSettings>(fallbackSettings);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function update(field: keyof StoreSettings, value: string | number | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await adminFetch("/api/admin/settings", { body: form, method: "PUT" });
      setMessage("Settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Settings save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader description="Store name, logo, delivery, default theme, and social links." title="Settings" />
      {message ? <AdminNotice message={message} /> : null}
      <form className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2" onSubmit={save}>
        <Field label="Store name"><Input value={form.storeName} onChange={(event) => update("storeName", event.target.value)} /></Field>
        <Field label="Logo URL">
          <Input value={form.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} />
          <span className="mt-2 block text-xs text-stone-500">
            Recommended: transparent PNG (or SVG). Horizontal logo ~240x80px, or square ~200x200px. Keep it under 500KB.
          </span>
        </Field>
        <Field label="Delivery charges"><Input inputMode="decimal" value={String(form.deliveryCharges)} onChange={(event) => update("deliveryCharges", Number(event.target.value || 0))} /></Field>
        <Field label="Default theme">
          <select className={selectClassName} value={form.defaultTheme} onChange={(event) => update("defaultTheme", event.target.value as "light" | "dark")}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
        <Field label="Instagram link"><Input value={form.instagramLink} onChange={(event) => update("instagramLink", event.target.value)} /></Field>
        <Field label="Facebook link"><Input value={form.facebookLink} onChange={(event) => update("facebookLink", event.target.value)} /></Field>
        <Field label="YouTube link"><Input value={form.youtubeLink} onChange={(event) => update("youtubeLink", event.target.value)} /></Field>
        <Button className="w-fit md:col-span-2" disabled={saving} type="submit"><Save className="size-4" />{saving ? "Saving..." : "Save settings"}</Button>
      </form>
    </>
  );
}
