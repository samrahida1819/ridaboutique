import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-full border border-brand-green/15 bg-white px-5 pr-11 text-sm text-brand-charcoal shadow-sm transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-brand-green/55 dark:text-stone-400"
      />
    </span>
  );
}
