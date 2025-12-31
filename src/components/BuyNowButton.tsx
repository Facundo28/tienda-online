"use client";

import { useRouter } from "next/navigation";

import { useCart } from "@/lib/cart/useCart";

type Props = {
  product: {
    id: string;
    name: string;
    priceCents: number;
  };
};



export function BuyNowButton({ product, className }: Props & { className?: string }) {
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className={className || "inline-flex w-full items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"}
      onClick={() => {
        addItem({ 
            productId: product.id, 
            name: product.name, 
            priceCents: product.priceCents 
        }, 1);
        router.push("/checkout");
      }}
    >
      Comprar ahora
    </button>
  );
}
