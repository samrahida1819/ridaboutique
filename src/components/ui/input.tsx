"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-full border border-brand-green/15 bg-white px-5 text-sm text-brand-charcoal shadow-sm transition placeholder:text-brand-charcoal/45 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-500",
        className
      )}
      {...props}
    />
  );
}

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className={cn(
          "h-12 w-full rounded-full border border-brand-green/15 bg-white py-0 pl-5 pr-12 text-sm text-brand-charcoal shadow-sm transition placeholder:text-brand-charcoal/45 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-500",
          className
        )}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-brand-green/70 transition hover:bg-brand-cream hover:text-brand-green"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-3xl border border-brand-green/15 bg-white px-5 py-4 text-sm text-brand-charcoal shadow-sm transition placeholder:text-brand-charcoal/45 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-500",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-brand-green/70">
        {label}
      </span>
      {children}
      {error ? <span className="mt-2 block text-xs font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}
