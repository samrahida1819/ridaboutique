"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ProductThumbProps = {
  alt: string;
  className?: string;
  fallbackLabel?: string;
  hoverImageClassName?: string;
  hoverSrc?: string;
  imageClassName?: string;
  sizes: string;
  src: string;
};

export function ProductThumb({
  alt,
  className,
  fallbackLabel,
  hoverImageClassName,
  hoverSrc,
  imageClassName,
  sizes,
  src
}: ProductThumbProps) {
  const [failed, setFailed] = useState(!src);
  const [hoverFailed, setHoverFailed] = useState(!hoverSrc);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  useEffect(() => {
    setHoverFailed(!hoverSrc);
  }, [hoverSrc]);

  return (
    <div aria-label={alt} className={cn("relative overflow-hidden rounded-lg bg-brand-cream", className)} role="img">
      <div className={cn("absolute inset-0 flex items-center justify-center p-3 text-center transition-opacity", failed ? "opacity-100" : "opacity-0")}>
        <span className="line-clamp-3 text-sm font-semibold leading-5 text-brand-green">
          {fallbackLabel || alt}
        </span>
      </div>
      {!failed ? (
        <Image
          alt=""
          aria-hidden="true"
          className={cn("object-cover text-transparent", imageClassName)}
          fill
          onError={() => setFailed(true)}
          sizes={sizes}
          src={src}
          unoptimized
        />
      ) : null}
      {!failed && hoverSrc && !hoverFailed ? (
        <Image
          alt=""
          aria-hidden="true"
          className={cn("object-cover text-transparent", hoverImageClassName)}
          fill
          onError={() => setHoverFailed(true)}
          sizes={sizes}
          src={hoverSrc}
          unoptimized
        />
      ) : null}
    </div>
  );
}
