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
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      {urls.length > 1 ? (
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide lg:w-[70px] shrink-0">
          {urls.map((src, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`${src}-${idx}`}
                type="button"
                className={
                  "relative shrink-0 w-12 h-12 lg:w-[60px] lg:h-[60px] rounded-md overflow-hidden border transition-all " +
                  (isSelected 
                    ? "border-[#12753e] ring-1 ring-[#12753e]" 
                    : "border-gray-200 hover:border-gray-300")
                }
                onMouseEnter={() => setSelectedIndex(idx)} // ML style: hover changes image
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="60px"
                  unoptimized={src.startsWith("/uploads/")}
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Main Image */}
      <div className="relative aspect-square w-full bg-white rounded-lg overflow-hidden lg:flex-1 cursor-zoom-in group">
        {selectedSrc ? (
          <Image
            src={selectedSrc}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 800px"
            unoptimized={selectedSrc.startsWith("/uploads/")}
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
    </div>
  );
}
