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
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      {urls.length > 1 ? (
        <div className="flex flex-row sm:flex-col gap-2 p-1 sm:p-3 overflow-x-auto sm:overflow-visible scrollbar-hide">
          {urls.map((src, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`${src}-${idx}`}
                type="button"
                className={
                  "shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 " +
                  (isSelected ? "opacity-100" : "opacity-80 hover:opacity-100")
                }
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <span
                  className={
                    "relative block h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-md border bg-foreground/5 " +
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

      <div className="relative aspect-square w-full flex-1 bg-foreground/5 max-h-[500px] border border-gray-100 rounded-lg overflow-hidden">
        {selectedSrc ? (
          <Image
            src={selectedSrc}
            alt={alt}
            fill
            className="object-contain"
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
