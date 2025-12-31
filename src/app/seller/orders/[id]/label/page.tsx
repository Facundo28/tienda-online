import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { PrintButton } from "@/components/PrintButton";

export default async function ShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) return notFound(); // Or redirect to login

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });

    if (!order) return notFound();

    // QR Code URL (using a public API for simplicity)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.id}`;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
            <div className="bg-white p-8 max-w-sm w-full border-4 border-black space-y-4 shadow-xl print:shadow-none print:border-2 print:w-full print:max-w-none print:absolute print:inset-0">
                
                {/* Header */}
                <div className="flex justify-between border-b-2 border-black pb-4">
                    <div className="font-bold text-xl tracking-tighter">MARKET E.C</div>
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
                 <PrintButton />
                 <p className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                    Pega esta etiqueta en la caja visible.
                 </p>
            </div>
        </div>
    );
}

