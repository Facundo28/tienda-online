"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCart } from "@/lib/cart/useCart";
import { formatCurrencyFromCents } from "@/lib/money";

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

// ... types
type PaymentMethod = 'CARD' | 'TRANSFER' | 'CASH';

export function CheckoutClient({
  initialForm,
}: {
  initialForm?: Partial<FormState>;
}) {
  const { cart, totals, clear } = useCart();
  const [form, setForm] = useState<FormState>(() => ({
    customerName: initialForm?.customerName ?? "",
    customerEmail: initialForm?.customerEmail ?? "",
    customerPhone: initialForm?.customerPhone ?? "",
    addressLine1: initialForm?.addressLine1 ?? "",
    addressLine2: initialForm?.addressLine2 ?? "",
    city: initialForm?.city ?? "",
    state: initialForm?.state ?? "",
    postalCode: initialForm?.postalCode ?? "",
  }));
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  // Mock card state - strictly styling/placeholder
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const basicValid = 
      cart.items.length > 0 &&
      form.customerName.trim() &&
      form.customerEmail.trim() &&
      form.addressLine1.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.postalCode.trim();
    
    if (!basicValid) return false;
    
    if (paymentMethod === 'CARD') {
        return card.number.length >= 15 && card.cvc.length >= 3 && card.expiry.length >= 4;
    }
    
    return true;
  }, [cart.items.length, form, paymentMethod, card]);

  async function submit() {
    setError(null);
    setOrderId(null);
    setSubmitting(true);

    try {
      // Simulate payment processing delay
      if (paymentMethod === 'CARD') {
          await new Promise(r => setTimeout(r, 1500));
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ... form data
          ...form,
          customerPhone: form.customerPhone || undefined,
          addressLine2: form.addressLine2 || undefined,
          items: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          paymentMethod,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Error en el checkout");
        return;
      }

      setOrderId(data.orderId);
      clear();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl py-6 px-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finalizar Compra</h1>
          <p className="text-sm text-gray-500 mt-1">
             Completa tus datos y selecciona el método de pago.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-[#3483fa] hover:underline"
          href="/cart"
        >
          Volver al carrito
        </Link>
      </div>

      {cart.items.length === 0 && !orderId ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-gray-500">Tu carrito está vacío.</p>
            <Link href="/products" className="text-[#12753e] font-semibold mt-2 inline-block">
                Ir a buscar productos
            </Link>
        </div>
      ) : orderId ? (
         <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-200">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                 </svg>
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Compra Exitosa!</h2>
             <p className="text-gray-600 mb-6">Tu pedido ha sido registrado correctamente.</p>
             <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block mb-6">
                 <span className="text-sm text-gray-500 block mb-1">CÓDIGO DE PEDIDO</span>
                 <span className="text-xl font-mono font-bold text-[#12753e]">{orderId}</span>
             </div>
             <div>
                 <Link href="/orders" className="bg-[#12753e] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0e5c30] transition-colors">
                     Ver mis compras
                 </Link>
             </div>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
           {/* Left Column: Forms */}
           <div className="space-y-8">
               
               {/* 1. Datos de Contacto */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-600">1</span>
                       Datos de Contacto
                   </h3>
                   <div className="grid grid-cols-1 gap-4">
                        <input
                            className="w-full rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                            placeholder="Nombre completo"
                            value={form.customerName}
                            onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                        />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                className="w-full rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                                placeholder="Email"
                                type="email"
                                value={form.customerEmail}
                                onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))}
                            />
                            <input
                                className="w-full rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                                placeholder="Teléfono"
                                value={form.customerPhone}
                                onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                            />
                         </div>
                   </div>
               </div>

               {/* 2. Envío */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-600">2</span>
                       Dirección de Envío
                   </h3>
                   <div className="grid grid-cols-1 gap-4">
                        <input
                            className="w-full rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                            placeholder="Calle y altura"
                            value={form.addressLine1}
                            onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
                        />
                         <input
                            className="w-full rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                            placeholder="Depto / Piso / Referencias (Opcional)"
                            value={form.addressLine2}
                            onChange={(e) => setForm((p) => ({ ...p, addressLine2: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                             <input
                                className="w-full rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                                placeholder="Ciudad"
                                value={form.city}
                                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                            />
                             <input
                                className="w-full rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                                placeholder="Provincia"
                                value={form.state}
                                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                            />
                             <input
                                className="w-full col-span-2 sm:col-span-1 rounded-lg border-gray-300 border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#12753e] focus:border-transparent outline-none transition-all"
                                placeholder="C. Postal"
                                value={form.postalCode}
                                onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                            />
                        </div>
                   </div>
               </div>

               {/* 3. Pago */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-600">3</span>
                       Método de Pago
                   </h3>
                   
                   <div className="grid grid-cols-1 gap-3 mb-6">
                       {/* Card Option */}
                       <div 
                          onClick={() => setPaymentMethod('CARD')}
                          className={`relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex items-center gap-4 transition-all ${paymentMethod === 'CARD' ? 'border-[#12753e] bg-green-50/50 ring-1 ring-[#12753e]' : 'border-gray-200'}`}
                       >
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'CARD' ? 'border-[#12753e]' : 'border-gray-300'}`}>
                                {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full bg-[#12753e]" />}
                           </div>
                           <div className="flex-1">
                               <p className="font-semibold text-gray-900">Tarjeta de Crédito / Débito</p>
                               <p className="text-xs text-gray-500">Promociones bancarias disponibles</p>
                           </div>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${paymentMethod === 'CARD' ? 'text-[#12753e]' : 'text-gray-400'}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                           </svg>
                       </div>

                       {/* Transfer Option */}
                       <div 
                          onClick={() => setPaymentMethod('TRANSFER')}
                          className={`relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex items-center gap-4 transition-all ${paymentMethod === 'TRANSFER' ? 'border-[#12753e] bg-green-50/50 ring-1 ring-[#12753e]' : 'border-gray-200'}`}
                       >
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'TRANSFER' ? 'border-[#12753e]' : 'border-gray-300'}`}>
                                {paymentMethod === 'TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-[#12753e]" />}
                           </div>
                           <div className="flex-1">
                               <p className="font-semibold text-gray-900">Transferencia Bancaria</p>
                               <p className="text-xs text-gray-500">Alias: MARKET.EC.PAGO</p>
                           </div>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${paymentMethod === 'TRANSFER' ? 'text-[#12753e]' : 'text-gray-400'}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                           </svg>
                       </div>

                       {/* Cash Option */}
                       <div 
                          onClick={() => setPaymentMethod('CASH')}
                          className={`relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex items-center gap-4 transition-all ${paymentMethod === 'CASH' ? 'border-[#12753e] bg-green-50/50 ring-1 ring-[#12753e]' : 'border-gray-200'}`}
                       >
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'CASH' ? 'border-[#12753e]' : 'border-gray-300'}`}>
                                {paymentMethod === 'CASH' && <div className="w-2.5 h-2.5 rounded-full bg-[#12753e]" />}
                           </div>
                           <div className="flex-1">
                               <p className="font-semibold text-gray-900">Efectivo</p>
                               <p className="text-xs text-gray-500">Pagar al retirar</p>
                           </div>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${paymentMethod === 'CASH' ? 'text-[#12753e]' : 'text-gray-400'}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                           </svg>
                       </div>
                   </div>

                   {/* Card Form */}
                   {paymentMethod === 'CARD' && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                           <div className="relative">
                               <input
                                   className="w-full rounded-lg border-gray-300 border bg-white px-4 py-3 pl-12 text-sm focus:ring-2 focus:ring-[#12753e] outline-none"
                                   placeholder="Número de Tarjeta"
                                   maxLength={19}
                                   value={card.number}
                                   onChange={(e) => {
                                       let val = e.target.value.replace(/\D/g, '');
                                       val = val.replace(/(.{4})/g, '$1 ').trim();
                                       setCard(p => ({ ...p, number: val }));
                                   }}
                               />
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                   </svg>
                               </div>
                           </div>
                           
                           <input
                               className="w-full rounded-lg border-gray-300 border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-[#12753e] outline-none"
                               placeholder="Nombre como figura en la tarjeta"
                               value={card.name}
                               onChange={(e) => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                           />
                           
                           <div className="grid grid-cols-2 gap-4">
                               <input
                                   className="w-full rounded-lg border-gray-300 border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-[#12753e] outline-none"
                                   placeholder="MM/AA"
                                   maxLength={5}
                                   value={card.expiry}
                                   onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2);
                                        setCard(p => ({ ...p, expiry: val }));
                                   }}
                               />
                               <input
                                   className="w-full rounded-lg border-gray-300 border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-[#12753e] outline-none"
                                   placeholder="CVC"
                                   maxLength={4}
                                   type="password"
                                   value={card.cvc}
                                   onChange={(e) => setCard(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '') }))}
                               />
                           </div>
                           <p className="text-xs text-gray-500 flex items-center gap-1">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600">
                                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                               </svg>
                               Tus datos están protegidos con encriptación SSL de 256-bits.
                           </p>
                       </div>
                   )}
                   
                   {paymentMethod === 'TRANSFER' && (
                       <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                           <p className="font-semibold mb-1">Transferencia Bancaria</p>
                           <p>Realiza la transferencia al Alias: <strong>MARKET.EC.PAGO</strong></p>
                           <p className="mt-2 text-xs opacity-80">Deberás adjuntar el comprobante en el detalle de la compra.</p>
                       </div>
                   )}
                   
                    {paymentMethod === 'CASH' && (
                       <div className="bg-orange-50 text-orange-800 p-4 rounded-lg text-sm">
                           <p className="font-semibold mb-1">Pago en Efectivo</p>
                           <p>Abonas al momento de retirar o recibir el producto.</p>
                       </div>
                   )}
               </div>

           </div>

           {/* Right Column: Order Summary */}
           <div className="lg:sticky lg:top-24 h-fit space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
                     <div className="space-y-3 mb-6">
                        {cart.items.map((item) => (
                          <div key={item.productId} className="flex justify-between text-sm">
                              <span className="text-gray-600 flex-1 truncate pr-4">{item.quantity}x {item.name}</span>
                              <span className="font-medium">{formatCurrencyFromCents(item.priceCents * item.quantity)}</span>
                          </div>
                        ))}
                     </div>
                     <div className="border-t border-gray-100 pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Subtotal</span>
                              <span className="font-medium">{formatCurrencyFromCents(totals.totalCents)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Envío</span>
                              <span className="text-green-600 font-medium">Gratis</span>
                          </div>
                     </div>
                     <div className="border-t border-gray-100 pt-4 mt-4 mb-6">
                          <div className="flex justify-between items-end">
                              <span className="text-base font-bold text-gray-900">Total</span>
                              <div className="text-right">
                                  <span className="text-2xl font-bold text-gray-900 block leading-none">{formatCurrencyFromCents(totals.totalCents)}</span>
                                  <span className="text-xs text-gray-400 font-normal">IVA incluido</span>
                              </div>
                          </div>
                     </div>
                     
                     {error && (
                         <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
                             {error}
                         </div>
                     )}

                     <button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit || submitting}
                        className="w-full bg-[#3483fa] hover:bg-blue-600 text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                        {submitting ? (
                            <>PROCESANDO...</>
                        ) : paymentMethod === 'CARD' ? (
                            <>PAGAR {formatCurrencyFromCents(totals.totalCents)}</>
                        ) : (
                            <>CONFIRMAR PEDIDO</>
                        )}
                     </button>
                     
                     <p className="text-center text-xs text-gray-400 mt-4">
                         Al confirmar aceptas nuestros términos y condiciones.
                     </p>
                </div>
           </div>
        </div>
      )}
    </section>
  );
}
