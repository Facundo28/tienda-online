"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from "react";
import { Cart, CartItem } from "./cartTypes";
import { loadCart, saveCart } from "./cartStorage";

type CartContextType = {
  cart: Cart;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totals: {
    itemsCount: number;
    totalCents: number;
  };
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCart(cart: Cart): Cart {
  const items = (cart.items ?? [])
    .filter((item) => item && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));
  return { items };
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize with empty to prevent hydration mismatch, then load in effect
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCart(normalizeCart(loadCart()));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveCart(cart);
    }
  }, [cart, isLoaded]);

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

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, setQuantity, clear, totals }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
