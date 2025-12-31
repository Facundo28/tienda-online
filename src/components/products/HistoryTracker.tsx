"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useEffect } from "react";

export function HistoryTracker({ productId }: { productId: string }) {
  const { addProduct } = useRecentlyViewed();

  useEffect(() => {
    addProduct(productId);
  }, [productId]);

  return null;
}
