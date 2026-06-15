"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  videoUrl
}: {
  images: string[];
  name: string;
  videoUrl?: string;
}) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  return (
    <div>
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-cream shadow-luxury md:aspect-[4/5] md:rounded-[1.75rem]"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
      >
        <Image
          alt={name}
          className="object-cover transition duration-700 group-hover:scale-110"
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          src={images[active]}
          style={{ transformOrigin: origin }}
          unoptimized
        />
        <div className="absolute right-4 top-4 flex gap-2">
          {videoUrl ? (
            <Button aria-label="Play product video" size="icon" variant="secondary">
              <PlayCircle className="size-4" />
            </Button>
          ) : null}
          <Button aria-label="Open fullscreen gallery" onClick={() => setFullscreen(true)} size="icon" variant="secondary">
            <Expand className="size-4" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 rounded-full bg-white/88 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">
          Hover to zoom
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
        {images.map((image, index) => (
          <button
            aria-label={`View image ${index + 1}`}
            className={cn(
              "relative aspect-square overflow-hidden rounded-2xl border bg-brand-cream transition",
              active === index ? "border-brand-gold" : "border-transparent opacity-72 hover:opacity-100"
            )}
            key={image}
            onClick={() => setActive(index)}
            type="button"
          >
            <Image
              alt={`${name} thumbnail ${index + 1}`}
              className="object-cover"
              fill
              sizes="120px"
              src={image}
              unoptimized
            />
          </button>
        ))}
      </div>

      <Modal open={fullscreen} onClose={() => setFullscreen(false)} title={name} className="max-w-5xl">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-cream">
          <Image alt={name} className="object-contain" fill sizes="90vw" src={images[active]} unoptimized />
        </div>
      </Modal>
    </div>
  );
}
