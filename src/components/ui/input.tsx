import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-full border border-brand-green/15 bg-white px-5 text-sm text-brand-charcoal shadow-sm transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-3xl border border-brand-green/15 bg-white px-5 py-4 text-sm text-brand-charcoal shadow-sm transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15",
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
