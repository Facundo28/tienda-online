"use client";

import { useRouter } from "next/navigation";

import { loadCart, saveCart } from "@/lib/cart/cartStorage";
import type { Cart } from "@/lib/cart/cartTypes";

type Props = {
  product: {
    id: string;
    name: string;
    priceCents: number;
  };
};

function addItemToCart(cart: Cart, item: Props["product"], quantity = 1): Cart {
  const qty = Math.max(1, Math.floor(quantity));
  const existing = cart.items.find((x) => x.productId === item.id);

  if (existing) {
    return {
      items: cart.items.map((x) =>
        x.productId === item.id ? { ...x, quantity: x.quantity + qty } : x,
      ),
    };
  }

  return {
    items: [
      ...cart.items,
      { productId: item.id, name: item.name, priceCents: item.priceCents, quantity: qty },
    ],
  };
}

export function BuyNowButton({ product }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
      onClick={() => {
        const cart = loadCart();
        const next = addItemToCart(cart, product, 1);
        saveCart(next);
        router.push("/checkout");
      }}
    >
      Comprar ahora
    </button>
  );
}
