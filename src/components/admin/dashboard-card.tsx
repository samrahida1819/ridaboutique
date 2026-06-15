import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  value,
  delta,
  icon,
  className
}: {
  title: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("rounded-[1.5rem] border border-brand-green/10 bg-white p-5 shadow-[0_1px_0_rgba(6,40,31,0.08)]", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green/55">{title}</p>
          <p className="mt-4 font-serif text-4xl text-brand-green">{value}</p>
        </div>
        {icon ? <div className="rounded-full bg-brand-cream p-3 text-brand-gold">{icon}</div> : null}
      </div>
      {delta ? <p className="mt-4 text-sm font-semibold text-brand-gold">{delta}</p> : null}
    </article>
  );
}
