"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BoostProductButtonProps {
  productId: string;
  isBoosted: boolean;
}

export function BoostProductButton({
  productId,
  isBoosted,
}: BoostProductButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBoost = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/boost`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Error al destacar producto");
      }

      toast.success("Producto destacado por 7 días");
      router.refresh();
    } catch (error) {
      toast.error("Error al intentar destacar el producto");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBoost}
      disabled={isLoading}
      className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
        isBoosted
          ? "border-yellow-400 bg-yellow-400/10 text-yellow-600 hover:bg-yellow-400/20"
          : "hover:bg-foreground/5"
      }`}
    >
      {isLoading ? "..." : isBoosted ? "Renovar Destacado" : "Destacar"}
    </button>
  );
}
