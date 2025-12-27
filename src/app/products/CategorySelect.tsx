"use client";

import { useRouter } from "next/navigation";

type Option = {
  value: string;
  label: string;
};

export function CategorySelect({
  options,
  selected,
}: {
  options: Option[];
  selected: string;
}) {
  const router = useRouter();

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
      aria-label="Filtrar por categoría"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
