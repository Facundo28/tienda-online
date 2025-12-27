"use client";

import { useCart } from "@/lib/cart/useCart";

type Props = {
  product: {
    id: string;
    name: string;
    priceCents: number;
  };
};

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
      onClick={() =>
        addItem({
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
        })
      }
    >
      Agregar al carrito
    </button>
  );
}
