"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminNotice, contentKeys, PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { fallbackWebsiteContent } from "@/data/store";
import { useWebsiteContent } from "@/hooks/use-store-data";
import { adminFetch } from "@/lib/admin-api-client";

export function AdminContentPage() {
  const { content } = useWebsiteContent();
  const [draft, setDraft] = useState(fallbackWebsiteContent);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  async function save() {
    setSaving(true);
    const rows = contentKeys.map((key) => ({
      key,
      title: key,
      body: draft[key]
    }));
    try {
      await adminFetch("/api/admin/content", { body: rows, method: "PUT" });
      setMessage("Website content saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Website content save failed.");
    } finally {
      setSaving(false);
    }
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
      <Button className="mt-5" disabled={saving} onClick={() => void save()}><Save className="size-4" />{saving ? "Saving..." : "Save content"}</Button>
    </>
  );
}
