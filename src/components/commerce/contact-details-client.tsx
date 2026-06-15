"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useAdminSettings } from "@/lib/admin-store";

export function ContactDetailsClient() {
  const settings = useAdminSettings();
  const whatsappDigits = (settings.whatsappNumber || settings.supportPhone).replace(/\D/g, "");
  const details = [
    [Mail, settings.supportEmail],
    [Phone, settings.supportPhone],
    [MessageCircle, settings.whatsappNumber || settings.supportPhone],
    [MapPin, settings.supportAddress || "Delivery across Kashmir"]
  ] as const;

  return (
    <>
      <p className="mt-4 text-sm leading-7 text-brand-charcoal/62">
        {settings.contactIntro}
      </p>
      <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4">
        {details.map(([Icon, text]) => (
          <div
            className="flex items-center gap-4 rounded-2xl bg-white p-4 text-sm text-brand-charcoal/70 shadow-[0_1px_0_rgba(6,40,31,0.08)]"
            key={text}
          >
            <Icon className="size-5 text-brand-gold" />
            {text}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <ButtonLink href={`https://wa.me/${whatsappDigits}`} target="_blank" variant="gold">
          Open WhatsApp
        </ButtonLink>
      </div>
    </>
  );
}
