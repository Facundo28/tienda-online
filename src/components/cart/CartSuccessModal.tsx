"use client";

import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrencyFromCents } from "@/lib/money";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: {
      name: string;
      priceCents: number;
      imageUrl?: string; 
  };
};

export function CartSuccessModal({ isOpen, onClose, product }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIsVisible(true);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    } else {
        setIsVisible(false);
        document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-[#12753e]">
                <CheckCircle2 size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">¡Agregaste un producto!</h2>
            <p className="text-sm text-gray-500 mb-6">¿Qué te gustaría hacer ahora?</p>

            <div className="bg-gray-50 rounded-lg p-4 w-full flex gap-4 items-center mb-6 text-left">
                 {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={product.imageUrl.split(/[\n,]+/)[0]} 
                        alt={product.name}
                        className="w-16 h-16 object-contain bg-white rounded-md border border-gray-100"
                    />
                 ) : (
                    <div className="w-16 h-16 bg-white rounded-md border border-gray-100 flex items-center justify-center text-xs text-gray-300">Sin foto</div>
                 )}
                 <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                     <p className="text-sm text-[#12753e] font-bold">{formatCurrencyFromCents(product.priceCents)}</p>
                 </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <Link
                    href="/cart"
                    className="w-full bg-[#12753e] text-white font-medium py-3 rounded-md hover:bg-[#0e5e32] transition-colors"
                >
                    Ver Carrito y Pagar
                </Link>
                <button
                    onClick={onClose}
                    className="w-full bg-white text-[#12753e] font-medium py-3 rounded-md border border-[#12753e] hover:bg-green-50 transition-colors"
                >
                    Seguir comprando
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
