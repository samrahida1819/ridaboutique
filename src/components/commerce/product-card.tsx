"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { ProductThumb } from "@/components/commerce/product-thumb";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useProductRating } from "@/lib/admin-store";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useShop();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);
  const soldOut = product.stockStatus === "Sold out";
  const activePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const compareAtPrice =
    product.originalPrice || (activePrice < product.price ? product.price : Math.ceil((activePrice * 1.14) / 100) * 100);
  const rating = useProductRating(product);
  const discountPercent = Math.max(
    0,
    Math.round(((compareAtPrice - activePrice) / compareAtPrice) * 100)
  );

  return (
    <motion.article
      className="group rounded-xl bg-white p-2 shadow-[0_1px_0_rgba(6,40,31,0.08)] ring-1 ring-brand-green/8 transition duration-500 hover:-translate-y-1 hover:shadow-luxury sm:rounded-2xl sm:p-3"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative">
        <Link aria-label={`View ${product.name}`} href={`/products/${product.slug}`}>
          <ProductThumb
            alt={product.name}
            className="aspect-square rounded-lg sm:rounded-xl"
            fallbackLabel={product.name}
            hoverImageClassName="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
            hoverSrc={product.hoverImage}
            imageClassName="object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-0"
            sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 50vw"
            src={product.image}
          />
        </Link>
        <span className="absolute left-2 top-2 rounded-full bg-brand-gold px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-green shadow-gold-soft sm:left-3 sm:top-3 sm:px-3 sm:text-[11px]">
          {discountPercent}% Off
        </span>
        <Button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 size-8 bg-white/90 text-brand-green hover:bg-brand-green hover:text-brand-ivory sm:right-3 sm:top-3 sm:size-10"
          onClick={() => {
            if (toggleWishlist(product)) {
              toast({
                title: wishlisted ? "Removed from wishlist" : "Saved to wishlist",
                description: product.name
              });
            }
          }}
          size="icon"
          variant="secondary"
        >
          <Heart className={wishlisted ? "size-4 fill-current" : "size-4"} />
        </Button>
      </div>
      <div className="px-1 pb-1 pt-2.5 sm:pt-3">
        <Link className="block" href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.25rem] font-serif text-sm leading-tight text-brand-green transition group-hover:text-brand-gold sm:min-h-[2.9rem] sm:text-xl">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-brand-charcoal/55">
            <Star className="size-3 fill-brand-gold text-brand-gold" />
            <span className="font-semibold text-brand-green">{rating.rating.toFixed(1)}</span>
            <span>({rating.count})</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-2">
            <p className="text-sm font-bold text-brand-charcoal sm:text-base">
              {formatCurrency(activePrice)}
            </p>
            {compareAtPrice > activePrice ? (
              <p className="text-[11px] text-brand-charcoal/42 line-through sm:text-xs">
                {formatCurrency(compareAtPrice)}
              </p>
            ) : null}
          </div>
        </Link>
        <Button
          aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
          className="mt-3 h-9 w-full rounded-full px-3 text-[11px] sm:h-10 sm:text-xs"
          disabled={soldOut}
          onClick={() => {
            if (addToCart(product)) {
              toast({
                title: "Added to cart",
                description: product.name
              });
            }
          }}
          variant={soldOut ? "secondary" : "primary"}
        >
          <ShoppingBag className="size-3.5" />
          {soldOut ? "Sold out" : "Add to cart"}
        </Button>
      </div>
    </motion.article>
  );
}
