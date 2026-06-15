import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/types/commerce";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      className="group block overflow-hidden rounded-xl bg-white shadow-[0_1px_0_rgba(6,40,31,0.08)] ring-1 ring-brand-green/10 transition duration-500 hover:-translate-y-1 hover:shadow-luxury sm:rounded-2xl"
      href={`/shop?query=${encodeURIComponent(collection.title)}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream sm:aspect-[5/4]">
        <Image
          alt={collection.title}
          className="object-cover transition duration-700 group-hover:scale-105"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={collection.image}
        />
        <div className="absolute inset-0 bg-brand-green/10 transition group-hover:bg-brand-green/25" />
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold sm:text-xs sm:tracking-[0.24em]">
          {collection.eyebrow}
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-brand-green sm:text-3xl">{collection.title}</h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-brand-charcoal/60 sm:text-sm sm:leading-6">{collection.description}</p>
          </div>
          <ArrowRight className="mt-2 size-5 shrink-0 text-brand-gold transition group-hover:translate-x-1" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-green/55">
          {collection.productCount} pieces
        </p>
      </div>
    </Link>
  );
}
