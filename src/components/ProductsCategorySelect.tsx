"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const options = [
  { value: "ALL", label: "Todas" },
  { value: "INDUMENTARIA", label: "Indumentaria" },
  { value: "VEHICULOS", label: "Vehículos" },
  { value: "INMUEBLES", label: "Inmuebles" },
  { value: "TECNOLOGIA", label: "Tecnología" },
  { value: "HOGAR", label: "Hogar" },
  { value: "SERVICIOS", label: "Servicios" },
  { value: "OTROS", label: "Otros" },
] as const;

export function ProductsCategorySelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Close when clicking outside or selecting
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(e.target as Node)) {
        detailsRef.current.removeAttribute("open");
      }
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleSelect = (category: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (category === "ALL") nextParams.delete("category");
    else nextParams.set("category", category);
    
    // Close dropdown
    if (detailsRef.current) detailsRef.current.removeAttribute("open");

    const qs = nextParams.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <details ref={detailsRef} className="relative group">
      <summary className="list-none flex items-center gap-1 cursor-pointer text-white/90 hover:text-white text-sm font-light">
        <span>Categorías</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>

      <div className="absolute top-full left-0 z-50 mt-2 w-56 rounded-md border bg-white py-1 shadow-lg text-gray-800">
         <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white"></div>
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => handleSelect(o.value)}
            className="block w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 hover:text-[#12753e] transition-colors"
          >
            {o.label}
          </button>
        ))}
      </div>
    </details>
  );
}
