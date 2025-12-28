import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DeliveryActions } from "./DeliveryActions";

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
  });

  if (!order) return notFound();
  
  // Basic security check
  if (order.courierId !== user.id && user.role !== "ADMIN" && user.role !== "LOGISTICS_ADMIN") {
      return (
        <div className="p-8 text-center text-red-600 font-bold">
            No tienes permiso para ver este envío.
        </div>
      );
  }

  // Google Maps Link
  const addressQuery = encodeURIComponent(`${order.addressLine1}, ${order.city}, ${order.state}`);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

  return (
    <div className="pb-24">
       {/* Fake Map Header */}
       <div className="h-48 bg-gray-200 w-full relative">
           <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Argentina&zoom=6&size=800x400&sensor=false')] bg-cover bg-center opacity-30 grayscale mix-blend-multiply" />
           <div className="absolute inset-0 flex items-center justify-center">
               <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold backdrop-blur shadow-sm border border-gray-100 flex items-center gap-1">
                   📍 {order.city}
               </span>
           </div>
       </div>

       <div className="p-6 space-y-6 -mt-6 bg-white rounded-t-3xl relative z-10 min-h-screen shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{order.customerName}</h1>
                <p className="text-blue-600 text-lg font-medium leading-tight mt-1">{order.addressLine1}</p>
                {order.addressLine2 && <p className="text-gray-500 text-sm mt-1">{order.addressLine2}</p>}
                
                <div className="flex gap-3 mt-6">
                    <a href={`tel:${order.customerPhone}`} className="flex-1 bg-gray-50 py-3 rounded-xl text-center font-bold text-gray-700 hover:bg-gray-100 border border-gray-100 transition-colors flex items-center justify-center gap-2">
                        📞 Llamar
                    </a>
                    <a href={mapsLink} target="_blank" className="flex-1 bg-blue-50 py-3 rounded-xl text-center font-bold text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors flex items-center justify-center gap-2">
                        🗺️ Mapa
                    </a>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Order Info */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                    <span>Paquete</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">#{order.id.slice(-4)}</span>
                </h3>
                <div className="space-y-3">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-start text-sm p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-700 font-medium">{item.product.name}</span>
                            <span className="font-bold bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100">
                <h4 className="font-bold text-yellow-800 text-sm mb-2 flex items-center gap-2">
                    ⚠️ Protocolo de Seguridad
                </h4>
                <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1.5 opacity-90">
                    <li>Verifica que estás en la dirección correcta.</li>
                    <li>Solicita la palabra clave si es requerida.</li>
                    <li>Toma una foto clara del paquete entregado.</li>
                </ul>
            </div>
            
            {/* Height Spacer for fixed bottom bar */}
            <div className="h-20" />
            
            <DeliveryActions orderId={order.id} />
       </div>
    </div>
  );
}
