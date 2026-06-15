"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container grid min-h-[55vh] place-items-center text-center">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
            Something went wrong
          </p>
          <h1 className="mt-4 font-serif text-3xl text-brand-green sm:text-5xl md:text-7xl">
            Let&apos;s refresh the boutique.
          </h1>
          <p className="mt-5 text-sm leading-7 text-brand-charcoal/70">
            A temporary issue interrupted this page. Please try again.
          </p>
          <Button className="mt-8" onClick={reset}>
            Try Again
          </Button>
        </div>
      </section>
    </main>
  );
}
