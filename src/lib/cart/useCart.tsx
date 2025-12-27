"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Cart, CartItem } from "./cartTypes";
import { loadCart, saveCart } from "./cartStorage";

function normalizeCart(cart: Cart): Cart {
  const items = (cart.items ?? [])
    .filter((item) => item && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));
  return { items };
}

export function useCart() {
  const [cart, setCart] = useState<Cart>(() => normalizeCart(loadCart()));

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.items.find((x) => x.productId === item.productId);
      if (existing) {
        return {
          items: prev.items.map((x) =>
            x.productId === item.productId
              ? { ...x, quantity: x.quantity + quantity }
              : x,
          ),
        };
      }
      return { items: [...prev.items, { ...item, quantity }] };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => ({
      items: prev.items.filter((x) => x.productId !== productId),
    }));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => ({
      items: prev.items
        .map((x) =>
          x.productId === productId
            ? { ...x, quantity: Math.max(1, Math.floor(quantity)) }
            : x,
        )
        .filter((x) => x.quantity > 0),
    }));
  }, []);

  const clear = useCallback(() => setCart({ items: [] }), []);

  const totals = useMemo(() => {
    const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCents = cart.items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );
    return { itemsCount, totalCents };
  }, [cart.items]);

  return { cart, addItem, removeItem, setQuantity, clear, totals };
}
