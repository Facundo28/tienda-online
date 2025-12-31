"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart/useCart";
import { formatCurrencyFromCents } from "@/lib/money";

import { BadgeCheck } from "lucide-react";

export function CartClient() {
  const { cart, removeItem, setQuantity, totals } = useCart();

  // Group items by seller
  const groupedItems = cart.items.reduce((acc, item) => {
      const sellerId = item.sellerId || "unknown";
      if (!acc[sellerId]) {
          acc[sellerId] = {
              sellerName: item.sellerName || "Vendedor",
              sellerIsVerified: item.sellerIsVerified,
              items: []
          };
      }
      acc[sellerId].items.push(item);
      return acc;
  }, {} as Record<string, { sellerName: string; sellerIsVerified?: boolean; items: typeof cart.items }>);

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Carrito de compras</h1>
          <p className="text-sm text-gray-500">
            Revisa tus productos antes de pagar.
          </p>
        </div>
        <Link
          className="text-[#12753e] font-semibold text-sm hover:underline"
          href="/products"
        >
          Ver más productos
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="text-gray-900 font-semibold mb-2">Tu carrito está vacío</div>
            <p className="text-sm text-gray-500 mb-6">¿No sabés qué comprar? ¡Miles de productos te esperan!</p>
            <Link href="/products" className="inline-block bg-[#12753e] text-white px-6 py-2 rounded-md font-medium hover:bg-[#0e5e32] transition-colors">
                Descubrir productos
            </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Cart Items */}
            <div className="flex-1 space-y-6">
                {Object.values(groupedItems).map((group, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Paquete {idx + 1}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Vendido por</span>
                                <Link 
                                    href={group.items[0].sellerId ? `/users/${group.items[0].sellerId}` : '#'} 
                                    className={`text-xs font-semibold hover:underline flex items-center gap-1 ${group.items[0].sellerId ? 'text-[#12753e]' : 'text-gray-700 pointer-events-none'}`}
                                >
                                    {group.sellerName}
                                    {group.sellerIsVerified && <BadgeCheck className="w-3 h-3 text-blue-500" />}
                                </Link>
                            </div>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {group.items.map((item) => (
                              <li key={item.productId} className="p-6 flex gap-4">
                                  {/* Image */}
                                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                                     {item.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={item.imageUrl.split(/[\n,]+/)[0]} 
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                        />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin foto</div>
                                     )}
                                  </div>

                                  <div className="flex-1">
                                      <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-medium text-gray-900 text-sm leading-snug">
                                              <Link href={`/products/${item.productId}`} className="hover:underline">
                                                {item.name}
                                              </Link>
                                          </h4>
                                          <button
                                            type="button"
                                            className="text-xs text-[#12753e] font-medium"
                                            onClick={() => removeItem(item.productId)}
                                          >
                                            Eliminar
                                          </button>
                                      </div>
                                      
                                      <div className="flex justify-between items-end mt-4">
                                          <div className="flex items-center border border-gray-200 rounded-md">
                                               <button 
                                                    className="px-3 py-1 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                                               >-</button>
                                               <span className="px-2 text-sm font-medium text-gray-900 w-8 text-center">{item.quantity}</span>
                                               <button 
                                                    className="px-3 py-1 text-[#12753e] hover:bg-green-50"
                                                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                                               >+</button>
                                          </div>
                                          <div className="text-lg font-normal text-gray-900">
                                              {formatCurrencyFromCents(item.priceCents * item.quantity)}
                                          </div>
                                      </div>
                                  </div>
                              </li>
                            ))}
                        </ul>
                        <div className="bg-green-50 px-6 py-3 text-sm text-[#12753e] font-medium border-t border-green-100 flex items-center gap-2">
                             Envío gratis en este paquete
                        </div>
                    </div>
                ))}
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-80 h-fit">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-6">Resumen de compra</h3>
                    
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Productos ({totals.itemsCount})</span>
                        <span>{formatCurrencyFromCents(totals.totalCents)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#00a650] mb-4">
                        <span>Envíos</span>
                        <span>Gratis</span>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-semibold text-gray-900 mb-6">
                        <span>Total</span>
                        <span>{formatCurrencyFromCents(totals.totalCents)}</span>
                    </div>

                    <Link
                      href="/checkout"
                      className="block w-full text-center bg-[#12753e] text-white py-3 rounded-md font-semibold hover:bg-[#0e5e32] transition-colors"
                    >
                      Continuar compra
                    </Link>
                </div>
            </div>
        </div>
      )}
    </section>
  );
}
