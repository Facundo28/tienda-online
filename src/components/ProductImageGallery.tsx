"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type ProductImageGalleryProps = {
  imageUrls: string[];
  alt: string;
};

export function ProductImageGallery({ imageUrls, alt }: ProductImageGalleryProps) {
  const urls = useMemo(() => imageUrls.filter(Boolean), [imageUrls]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedSrc = urls[selectedIndex] ?? null;

  return (
    <div className="flex gap-3">
      {urls.length > 1 ? (
        <div className="flex flex-col gap-2 p-3">
          {urls.map((src, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`${src}-${idx}`}
                type="button"
                className={
                  "rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 " +
                  (isSelected ? "opacity-100" : "opacity-80 hover:opacity-100")
                }
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <span
                  className={
                    "relative block h-14 w-14 overflow-hidden rounded-md border bg-foreground/5 " +
                    (isSelected ? "ring-2 ring-foreground/20" : "")
                  }
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized={src.startsWith("/uploads/")}
                  />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="relative aspect-[4/3] w-full flex-1 bg-foreground/5">
        {selectedSrc ? (
          <Image
            src={selectedSrc}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            unoptimized={selectedSrc.startsWith("/uploads/")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground/60">
            Sin imagen
          </div>
        )}
      </div>
    </div>
  );
}
