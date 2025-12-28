"use client";
import { useUser } from "@/lib/auth/client"; // We'll use client side for printing for now or fetch server side
import { useEffect, useState } from "react";
import QRCode from "react-qr-code"; // Needs npm install react-qr-code ? Or use a simple img API?
// Let's use a simple img API to avoid deps for now, or assume react-qr-code if installed.
// User didn't ask for deps. I'll use a public API or a simple svg library if available.
// Actually, `react-qr-code` is standard but might not be in package.json.
// Safest: Use a library-less approach or assume I can install.
// I'll assume I can install or user has it. If not, I'll use google charts API for QR as fallback.
// Better: Use `src/app/seller/orders/[id]/label/page.tsx` as server component.

// RE-WRITING AS SERVER COMPONENT (Standard)
// Need to handle missing params.
import { notFound } from "next/navigation";
import { formatCurrencyFromCents } from "@/lib/money";

// Mock data for now if prisma fails? No, use prisma.
import { prisma } from "@/lib/prisma"; // This won't work in client component easily without logic. 
// Let's make it a server component that fetches data and passes to client print view.

export default async function ShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Use a direct import style for prisma if needed, but standard should work.
  // I need to import prisma from lib.
  
  // Since I can't import prisma inside the function easily without cleaner code:
  // I'll write the full file content properly.
  return (
      <ShippingLabelContent id={id} />
  );
}

import { requireUser } from "@/lib/auth/session";

async function ShippingLabelContent({ id }: { id: string }) {
    const user = await requireUser();
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });

    if (!order) return notFound();

    // QR Code URL (Google Charts is reliable for MVP without deps)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.id}`;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
            <div className="bg-white p-8 max-w-sm w-full border-4 border-black space-y-4 shadow-xl print:shadow-none print:border-2 print:w-full print:max-w-none print:absolute print:inset-0">
                
                {/* Header */}
                <div className="flex justify-between border-b-2 border-black pb-4">
                    <div className="font-bold text-xl tracking-tighter">MARKET ONLINE</div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-500">Prioridad</div>
                        <div className="text-xl font-black">STANDARD</div>
                    </div>
                </div>

                {/* Receiver */}
                <div>
                   <div className="text-[10px] uppercase font-bold text-gray-500">Entregar A:</div>
                   <div className="text-lg font-bold leading-tight">{order.customerName}</div>
                   <div className="text-md leading-tight">{order.addressLine1}</div>
                   <div className="text-md uppercase">{order.city}, {order.state}</div>
                   <div className="text-md font-mono">{order.postalCode}</div>
                   <div className="text-sm mt-1">Tel: {order.customerPhone}</div>
                </div>

                {/* QR & Tracking */}
                <div className="flex gap-4 border-t-2 border-black pt-4">
                    <img src={qrUrl} alt="QR Code" className="w-24 h-24 border" />
                    <div className="flex-1 min-w-0">
                         <div className="text-[10px] uppercase font-bold text-gray-500">Tracking ID:</div>
                         <div className="font-mono text-xs break-all leading-tight mb-2">{order.id}</div>
                         
                         <div className="bg-black text-white text-[10px] p-1 text-center font-bold">
                             REQUIERE CLAVE
                         </div>
                    </div>
                </div>

                {/* Sender */}
                <div className="border-t-2 border-black pt-2 text-xs text-gray-500 flex justify-between">
                    <span>De: {user.name} (Vendedor)</span>
                    <span>Peso: 0.5kg</span>
                </div>

            </div>

            <div className="fixed bottom-8 print:hidden flex flex-col items-center gap-2">
                 <button 
                    onClick="window.print()" 
                    className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                 >
                    🖨️ Imprimir Etiqueta
                 </button>
                 <p className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                    Pega esta etiqueta en la caja visible.
                 </p>
            </div>
            
            <script dangerouslySetInnerHTML={{__html: `
                document.querySelector('button').addEventListener('click', () => window.print());
            `}} />
        </div>
    );
}

