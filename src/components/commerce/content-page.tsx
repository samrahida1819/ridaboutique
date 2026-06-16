"use client";

import { useWebsiteContent } from "@/hooks/use-store-data";
import type { WebsiteContentKey } from "@/types/commerce";

const titles: Record<WebsiteContentKey, string> = {
  about: "About Us",
  faq: "FAQ",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  shipping: "Shipping Policy",
  returns: "Return Policy"
};

export function ContentPage({ contentKey }: { contentKey: WebsiteContentKey }) {
  const { content, loading } = useWebsiteContent(contentKey);
  const body = content[contentKey];

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-stone-500">Rida Boutique</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{titles[contentKey]}</h1>
        {loading ? (
          <div className="mt-8 h-52 animate-pulse rounded-lg bg-stone-100 dark:bg-neutral-900" />
        ) : (
          <div className="mt-8 whitespace-pre-line rounded-lg border border-stone-200 bg-white p-6 text-sm leading-7 text-stone-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-300">
            {body}
          </div>
        )}
      </div>
    </section>
  );
}
