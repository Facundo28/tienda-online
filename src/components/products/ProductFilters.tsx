"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ProductCategory } from "@/generated/prisma/enums";

type Props = {
  categories: { name: string; count: number; value: string }[];
  locations: { name: string; count: number; value: string }[];
  conditions: { name: string; count: number; value: string }[];
};

export function ProductFilters({ categories, locations, conditions }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const currentCategory = searchParams.get("category");
  const currentCondition = searchParams.get("condition");
  const currentLocation = searchParams.get("location");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    startTransition(() => {
        router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Categorías</h3>
        <ul className="space-y-1">
            <li>
                <button 
                  onClick={() => updateFilter("category", null)}
                  className={`text-sm hover:text-[#12753e] ${!currentCategory ? 'text-[#12753e] font-medium' : 'text-gray-600'}`}
                >
                    Todas
                </button>
            </li>
          {categories.map((cat) => (
            <li key={cat.value}>
              <button
                onClick={() => updateFilter("category", cat.value)}
                className={`text-sm hover:text-[#12753e] text-left block w-full ${currentCategory === cat.value ? 'text-[#12753e] font-medium' : 'text-gray-600'}`}
              >
                {cat.name} <span className="text-gray-400 text-xs">({cat.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Precio</h3>
        <div className="flex items-center gap-2 mb-2">
            <input 
                type="number" 
                placeholder="Mínimo" 
                className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="text-gray-400">-</span>
            <input 
                type="number" 
                placeholder="Máximo" 
                className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
            />
        </div>
        <button 
            onClick={handlePriceApply}
            disabled={isPending}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            title="Aplicar precio"
        >
            <span className="sr-only">Aplicar</span>
            →
        </button>
      </div>

      {/* Conditions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Condición</h3>
        <ul className="space-y-1">
          {conditions.map((cond) => (
            <li key={cond.value}>
              <button
                onClick={() => updateFilter("condition", currentCondition === cond.value ? null : cond.value)}
                className={`text-sm hover:text-[#12753e] text-left block w-full ${currentCondition === cond.value ? 'text-[#12753e] font-medium' : 'text-gray-600'}`}
              >
                {cond.name} <span className="text-gray-400 text-xs">({cond.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
        
      {/* Locations */}
       <div>
        <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
        <ul className="space-y-1">
          {locations.map((loc) => (
            <li key={loc.value}>
              <button
                 onClick={() => updateFilter("location", currentLocation === loc.value ? null : loc.value)}
                className={`text-sm hover:text-[#12753e] text-left block w-full truncate ${currentLocation === loc.value ? 'text-[#12753e] font-medium' : 'text-gray-600'}`}
              >
                {loc.name} <span className="text-gray-400 text-xs">({loc.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
