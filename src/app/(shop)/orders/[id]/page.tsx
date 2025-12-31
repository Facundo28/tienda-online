import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrencyFromCents } from "@/lib/money";
import Link from "next/link";
import { DeliveryStatus } from "@/generated/prisma/enums";
import { ConfirmReceiptButton } from "@/components/ConfirmReceiptButton";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
        items: {
            include: { product: true }
        }
    }
  });

  if (!order) return notFound();
  
  // Security Check: Only the buyer (or admin) can see this page
  if (order.userId !== user.id && user.role !== "ADMIN") {
      return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Detalle del Pedido</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold 
              ${order.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {order.deliveryStatus}
          </span>
      </div>

      {/* SECURITY WORDS CARD */}
      {order.deliveryMethod === 'DELIVERY' && order.deliveryStatus !== 'DELIVERED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.82 11.36h7.11L8 12.915l3.243-3.003L12 10.665l.757-.753L16 12.915l-1.93-1.555h7.11a12.739 12.739 0 00-.065-5.595.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08zM12 19.865v-3.3l-2.07 1.667L12 19.865z" clipRule="evenodd" />
                      <path d="M12.793 18.005l2.07 1.667v-3.333l-2.07 1.666z" />
                  </svg>
                  <h2 className="text-lg font-bold">Tu Clave de Seguridad</h2>
              </div>
              <p className="text-sm text-blue-600 max-w-md mx-auto">
                  Dile estas 3 palabras al repartidor cuando llegue a tu domicilio. 
                  <br /><strong>¡No se las des a nadie por teléfono!</strong>
              </p>
              
              <div className="flex justify-center gap-4 py-4">
                 {order.securityKeywords?.split("-").map((word, i) => (
                     <div key={i} className="bg-white border-2 border-blue-200 px-6 py-3 rounded-lg text-xl font-mono font-bold text-blue-900 shadow-sm uppercase tracking-wider">
                         {word}
                     </div>
                 ))}
              </div>
          </div>
      )}

      {/* Pickup QR */}
      {order.deliveryMethod === 'PICKUP' && order.deliveryStatus !== 'DELIVERED' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center space-y-4">
              <h2 className="text-lg font-bold">Código de Retiro</h2>
              <div className="bg-white p-4 rounded-lg inline-block text-4xl font-mono font-bold tracking-widest border-2 border-dashed">
                  {order.pickupCode}
              </div>
              <p className="text-sm text-gray-500">Muestra este código al vendedor.</p>
          </div>
      )}

      {/* Items List */}
      <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-medium text-sm">Productos</div>
          <div className="divide-y">
              {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl">📦</div>
                      <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                      <div className="ml-auto font-medium">
                          {formatCurrencyFromCents(item.priceCents)}
                      </div>
                  </div>
              ))}
          </div>
          <div className="p-4 bg-gray-50 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrencyFromCents(order.totalCents)}</span>
          </div>
      </div>
      
      {/* Receipt Confirmation */}
      {order.status !== 'CANCELLED' && (
          <ConfirmReceiptButton 
              orderId={order.id} 
              isDelivered={order.deliveryStatus === 'DELIVERED'} 
              fundsReleased={order.fundsReleased}
          />
      )}
      
      <div className="text-center">
          <Link href="/orders" className="text-sm text-blue-600 hover:underline">
              ← Volver a mis compras
          </Link>
      </div>
    </div>
  );
}
