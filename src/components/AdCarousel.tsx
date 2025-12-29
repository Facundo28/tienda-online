"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl: string | null;
};

export function AdCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full aspect-[3/1] md:aspect-[4/1] bg-gray-100 rounded-2xl overflow-hidden shadow-sm group">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {banner.redirectUrl ? (
             <Link href={banner.redirectUrl} className="block w-full h-full relative">
                <Image 
                    src={banner.imageUrl.startsWith("http") ? banner.imageUrl : `/${banner.imageUrl}`} 
                    alt={banner.title} 
                    fill 
                    className="object-cover" 
                    priority={index === 0}
                />
             </Link>
          ) : (
            <div className="w-full h-full relative">
                 <Image 
                    src={banner.imageUrl.startsWith("http") ? banner.imageUrl : `/${banner.imageUrl}`} 
                    alt={banner.title} 
                    fill 
                    className="object-cover" 
                    priority={index === 0}
                />
            </div>
          )}
          
          {/* Gradient Overlay for Text legibility if needed, opting for clean look now */}
        </div>
      ))}

      {/* Controls */}
      {banners.length > 1 && (
          <>
            <button 
                onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button 
                onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
                <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            idx === current ? "bg-white w-6" : "bg-white/50 hover:bg-white"
                        }`}
                    />
                ))}
            </div>
          </>
      )}
    </div>
  );
}
