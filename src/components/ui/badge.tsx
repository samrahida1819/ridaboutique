import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-brand-gold/35 bg-brand-champagne/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-green",
        className
      )}
      {...props}
    />
  );
}
