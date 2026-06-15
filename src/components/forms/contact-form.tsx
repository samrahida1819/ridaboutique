"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { ADMIN_MESSAGES_KEY } from "@/lib/admin-store";

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

    const message = {
      id: `MSG-${Date.now()}`,
      ...form,
      status: "New",
      date: new Date().toISOString().slice(0, 10),
      replyNote: ""
    };
    const storedMessages = window.localStorage.getItem(ADMIN_MESSAGES_KEY);
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    window.localStorage.setItem(ADMIN_MESSAGES_KEY, JSON.stringify([message, ...messages]));
    window.dispatchEvent(new CustomEvent("rida-admin-storage", { detail: { key: ADMIN_MESSAGES_KEY } }));

    setForm(initialState);
    toast({
      title: "Message received",
      description: "Rida Boutique support will respond by email or WhatsApp."
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
        Send Message
      </Button>
    </form>
  );
}
