import type { Cart } from "./cartTypes";

const STORAGE_KEY = "tienda_cart_v1";

export function loadCart(): Cart {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed?.items?.length) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

export function saveCart(cart: Cart) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
