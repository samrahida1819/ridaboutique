import { Star } from "lucide-react";
import type { Testimonial } from "@/types/commerce";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-[0_1px_0_rgba(6,40,31,0.08)]">
      <div className="flex gap-1 text-brand-gold">
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star className="size-4 fill-current" key={index} />
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-brand-charcoal/72">“{testimonial.quote}”</p>
      <div className="mt-6">
        <p className="font-serif text-2xl text-brand-green">{testimonial.name}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-charcoal/45">
          {testimonial.location}
        </p>
      </div>
    </article>
  );
}
