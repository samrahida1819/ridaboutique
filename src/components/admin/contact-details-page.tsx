"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminNotice, PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { fallbackContactDetails } from "@/data/store";
import { useContactDetails } from "@/hooks/use-store-data";
import { adminFetch } from "@/lib/admin-api-client";
import type { ContactDetails } from "@/types/commerce";

export function AdminContactDetailsPage() {
  const { contactDetails } = useContactDetails();
  const [form, setForm] = useState<ContactDetails>(fallbackContactDetails);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(contactDetails);
  }, [contactDetails]);

  function update(field: keyof ContactDetails, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await adminFetch("/api/admin/contact-details", { body: form, method: "PUT" });
      setMessage("Contact details saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Contact details save failed.");
    } finally {
      setSaving(false);
    }
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
        <Button className="w-fit md:col-span-2" disabled={saving} type="submit"><Save className="size-4" />{saving ? "Saving..." : "Save contact details"}</Button>
      </form>
    </>
  );
}
