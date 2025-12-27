"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isProducts = pathname === "/products";
  if (!isProducts) return null;

  const selected = searchParams.get("category") ?? "ALL";

  return (
    <select
      className="rounded-md border bg-background px-3 py-2 text-sm font-medium"
      value={selected}
      onChange={(e) => {
        const next = e.currentTarget.value;
        if (next === "ALL") {
          router.push("/products");
        } else {
          router.push(`/products?category=${encodeURIComponent(next)}`);
        }
      }}
      aria-label="Categorías"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
