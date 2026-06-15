import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-serif text-3xl leading-tight text-brand-green sm:text-4xl md:mt-4 md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-sm leading-7 text-brand-charcoal/68 md:text-base">{description}</p>
      ) : null}
    </div>
  );
}
