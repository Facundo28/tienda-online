"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/useCart";
import { useEffect, useState } from "react";

export function CartWidget() {
  // Use useCart hook to get live count
  const { totals } = useCart();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/cart" className="relative hover:opacity-100 opacity-90 group transition-all">
      <ShoppingCart className="w-5 h-5 text-white" />
      
      {mounted && totals.itemsCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-[#126e30]">
           {totals.itemsCount > 99 ? "99+" : totals.itemsCount}
        </span>
      )}
    </Link>
  );
}
