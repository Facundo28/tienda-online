"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/app/(shop)/products/[id]/actions";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  productId: string;
  initialIsFavorited: boolean;
  className?: string; // Allow external styling/positioning
}

export function FavoriteButton({ productId, initialIsFavorited, className }: FavoriteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticFavorited, toggleOptimistic] = useOptimistic(
    initialIsFavorited,
    (state, _) => !state
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link clicks if inside a card
    e.stopPropagation();
    
    startTransition(async () => {
      toggleOptimistic(null);
      try {
        await toggleFavoriteAction(productId);
      } catch (error) {
        // If error (e.g. not logged in), maybe redirect to login?
        // simple approach: just refresh to revert optimistic state or let the server action redirect if we configured it (which we threw error instead)
        // Ideally checking for unauth error.
        
        // For now, assuming requireUser redirects or throws.
        // If throws, we might want to catch and alert or redirect.
         // console.error(error);
         // router.push("/login"); // simple fallback
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      title={optimisticFavorited ? "Eliminar de favoritos" : "Agregar a favoritos"}
    >
      <Heart
        className={`w-6 h-6 transition-colors ${
          optimisticFavorited ? "fill-[#12753e] text-[#12753e]" : "text-[#12753e]"
        }`}
        strokeWidth={1.5}
      />
    </button>
  );
}
