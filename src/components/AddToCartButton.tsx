"use client";

import { useCart } from "@/lib/cart/useCart";

type Props = {
  product: {
    id: string;
    name: string;
    priceCents: number;
    sellerId?: string;
    sellerName?: string;
    sellerIsVerified?: boolean;
    imageUrl?: string;
  };
};

import { useState } from "react";
import { CartSuccessModal } from "@/components/cart/CartSuccessModal";

export function AddToCartButton({ product, className, size = 'default' }: Props & { className?: string, size?: 'default' | 'sm' }) {
  const { addItem } = useCart();
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      sellerIsVerified: product.sellerIsVerified,
      imageUrl: product.imageUrl,
    });
    setShowModal(true);
  };

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none 
          ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          ${className ? className : 'bg-foreground text-background hover:opacity-90'}
        `}
        onClick={handleAddToCart}
      >
        Lo quiero
      </button>

      <CartSuccessModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        product={product}
      />
    </>
  );
}
