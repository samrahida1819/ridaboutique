"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useContactDetails } from "@/hooks/use-store-data";

export function ContactPageClient() {
  const { contactDetails } = useContactDetails();
  const whatsappDigits = contactDetails.whatsappNumber.replace(/\D/g, "");

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm uppercase tracking-wide text-stone-500">Contact</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Contact Us</h1>
          <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Use the details below for order support, custom product questions, returns, or store information.
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            <a className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950" href={`mailto:${contactDetails.email}`}>
              <Mail className="size-4" />
              {contactDetails.email}
            </a>
            <a className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950" href={`tel:${contactDetails.primaryPhone.replace(/\s/g, "")}`}>
              <Phone className="size-4" />
              {contactDetails.primaryPhone}
            </a>
            <a className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950" href={`https://wa.me/${whatsappDigits}`} rel="noreferrer" target="_blank">
              <MessageCircle className="size-4" />
              {contactDetails.whatsappNumber}
            </a>
            <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
              <MapPin className="mt-1 size-4" />
              <span>{contactDetails.businessAddress}</span>
            </div>
          </div>
          <ButtonLink className="mt-6" href={`https://wa.me/${whatsappDigits}`} target="_blank">
            Open WhatsApp
          </ButtonLink>
        </div>

        <form className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-xl font-semibold">Send a message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input placeholder="Your name" /></Field>
            <Field label="Email"><Input placeholder="you@example.com" type="email" /></Field>
          </div>
          <Field label="Phone"><Input placeholder="+91" /></Field>
          <Field label="Message"><Textarea placeholder="How can we help?" /></Field>
          <button className="rounded-md bg-neutral-950 px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-950" type="button">
            Message form placeholder
          </button>
          <p className="text-xs text-stone-500">This frontend form is ready for a future email/API handler.</p>
        </form>
      </div>
    </section>
  );
}
