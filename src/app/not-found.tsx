import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container grid min-h-[55vh] place-items-center text-center">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">404</p>
          <h1 className="mt-4 font-serif text-3xl text-brand-green sm:text-5xl md:text-7xl">
            This piece is no longer here.
          </h1>
          <p className="mt-5 text-sm leading-7 text-brand-charcoal/70">
            The page may have moved, sold out, or been tucked away for a future collection.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/shop" as={Link}>
              Return to Shop
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
