"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { useContactDetails } from "@/hooks/use-store-data";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  topic: "Order Support",
  message: ""
};

export function ContactForm() {
  const { toast } = useToast();
  const { contactDetails } = useContactDetails();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});

  function update<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof ContactFormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Valid email is required.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast({ kind: "info", title: "Please complete the required fields." });
      return;
    }

    const text = [
      `New enquiry for ${contactDetails.storeName || "Rida Boutique"}`,
      `Topic: ${form.topic}`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : "",
      "",
      form.message
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = buildWhatsappUrl(contactDetails.whatsappNumber, text);

    if (!whatsappUrl) {
      toast({
        kind: "error",
        title: "WhatsApp number not set",
        description: "Please call or email us directly for now."
      });
      return;
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setForm(initialState);
    toast({
      title: "Opening WhatsApp",
      description: "Send the prefilled message and our team will reply quickly."
    });
  }

  return (
    <form className="grid gap-4 rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-6 md:rounded-[1.75rem]" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field error={errors.name} label="Name">
          <Input value={form.name} onChange={(event) => update("name", event.target.value)} />
        </Field>
        <Field error={errors.email} label="Email">
          <Input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
        </Field>
        <Field label="Phone">
          <Input inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
        </Field>
        <Field label="Topic">
          <Select value={form.topic} onChange={(event) => update("topic", event.target.value)}>
            {["Order Support", "Custom Order", "Returns", "Wholesale / Collaboration", "General"].map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field error={errors.message} label="Message">
        <Textarea value={form.message} onChange={(event) => update("message", event.target.value)} />
      </Field>
      <Button className="w-full md:w-auto md:justify-self-end" type="submit">
        Send on WhatsApp
      </Button>
    </form>
  );
}
