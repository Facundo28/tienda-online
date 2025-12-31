"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useEffect, useState } from "react";
import { Product } from "@/generated/prisma/client";
import Link from "next/link";
import { formatCurrencyFromCents } from "@/lib/money";

// We'll pass a server action or fetcher here? No, we can just fetch from an API route or pass a server action.
// For simplicity, let's assume we pass a fetcher function or use an ephemeral API route.
// Actually, creating a server action is cleaner.

import { navGetRecentProducts } from "@/app/actions/nav"; // We'll create this

export function RecentlyViewed() {
  const { recentIds } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recentIds.length > 0) {
      setLoading(true);
      navGetRecentProducts(recentIds)
        .then(setProducts)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [recentIds]);

  if (products.length === 0) return null;

  return (
    <section className="py-12 mt-8">
      <div className="max-w-[1184px] mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
            <h2 className="text-[24px] font-normal text-gray-900">Visto recientemente</h2>
            <Link href="/history" className="text-sm text-blue-500 hover:underline mt-1">Ver historial</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className="group block bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="aspect-[1.1] relative border-b border-gray-50 p-6 bg-white flex items-center justify-center">
                        {p.imageUrl ? (
                             <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No imagen</div>
                        )}
                    </div>
                    <div className="p-4 pt-3 flex-1 flex flex-col">
                        <div className="font-normal text-[22px] text-gray-900 mb-1 leading-none">
                            {formatCurrencyFromCents(p.priceCents)}
                        </div>
                        
                        {(!p.priceCents || p.priceCents > 2000000) && (
                             <div className="text-xs text-[#00a650] font-bold mb-2">Envío gratis</div>
                        )}
                        {!p.priceCents && <div className="text-xs text-[#00a650] font-semibold mb-2">Mismo precio en cuotas</div>}

                        <p className="text-sm text-gray-600 line-clamp-2 leading-snug font-light">
                            {p.name}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
