"use client";

import { useEffect, useState } from "react";

const KEY = "tienda_recently_viewed";

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    // Load on mount
    const stored = localStorage.getItem(KEY);
    if (stored) {
      try {
        setRecentIds(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing recently viewed", e);
      }
    }
  }, []);

  const addProduct = (id: string) => {
    setRecentIds((prev) => {
      // Remove if exists to push to top
      const filtered = prev.filter((pId) => pId !== id);
      // Add to front, limit to 10
      const updated = [id, ...filtered].slice(0, 10);
      
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { recentIds, addProduct };
}
