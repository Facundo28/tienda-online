import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CancelOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) redirect("/orders");

  if (order.status === 'CANCELLED' || order.deliveryStatus === 'DELIVERED') {
      return (
          <div className="max-w-xl mx-auto py-20 px-4 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">No se puede cancelar</h1>
              <p className="text-gray-500 mb-6">Este pedido ya fue entregado o cancelado.</p>
              <Link href="/orders" className="text-blue-600 hover:underline">Volver a mis compras</Link>
          </div>
      );
  }

  if (order.deliveryStatus === 'ON_WAY') {
      return (
          <div className="max-w-xl mx-auto py-20 px-4 text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                 </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido en camino</h1>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Tu paquete ya está con el transportista. Por seguridad, no se puede cancelar ahora.
                  <br/>
                  Podrás iniciar una devolución gratuita una vez que lo recibas.
              </p>
              <div className="flex justify-center gap-4">
                  <Link href={`/orders/${id}/chat`} className="text-blue-600 hover:underline font-medium">Contactar Vendedor</Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/orders" className="text-gray-600 hover:text-gray-900">Volver a mis compras</Link>
              </div>
          </div>
      );
  }

  async function cancelOrder(formData: FormData) {
    "use server";
    const reason = formData.get("reason") as string;
    
    if (!reason || reason.trim().length < 5) {
        return; 
    }

    // 1. Update Status
    const updatedOrder = await prisma.order.update({
        where: { id },
        data: { 
            status: 'CANCELLED',
            cancellationReason: reason
        },
        include: { items: { include: { product: true } } }
    });

    // 2. Add Explanation to Chat
    await prisma.orderMessage.create({
        data: {
            orderId: id,
            userId: user.id,
            message: `[SISTEMA] El comprador canceló el pedido. Motivo: "${reason}"`
        }
    });

    // 3. Notify Seller
    // We assume the first item's owner is the seller for this order (Multi-vendor carts might split orders, but for now 1 order = 1 seller usually)
    const sellerId = updatedOrder.items[0]?.product.userId;
    if (sellerId && sellerId !== user.id) {
        await prisma.notification.create({
            data: {
                userId: sellerId,
                title: "Venta Cancelada",
                message: `El comprador canceló el pedido #${id.slice(-4)}. Motivo: ${reason}`,
                href: `/orders/${id}/chat`,
                type: 'WARNING'
            }
        });
    }

    // 4. Redirect to Chat
    redirect(`/orders/${id}/chat`);
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirmar Cancelación</h1>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <p className="text-gray-700 mb-4">
              ¿Estás seguro que deseas cancelar el pedido <span className="font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</span>?
          </p>
          <ul className="mb-6 space-y-2">
              {order.items.map((item: any) => (
                  <li key={item.id} className="text-sm text-gray-600 flex justify-between">
                      <span>{item.quantity}x {item.product.name}</span>
                  </li>
              ))}
          </ul>
          
          <form action={cancelOrder} className="flex flex-col gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la cancelación</label>
                  <textarea 
                      name="reason" 
                      required 
                      minLength={5}
                      placeholder="Ej: Me arrepentí, encontré mejor precio, no es lo que pedí..."
                      className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                      Esto iniciará un chat con el vendedor para gestionar el reembolso si corresponde.
                  </p>
              </div>

              <div className="flex gap-3 mt-2">
                  <Link 
                      href="/orders" 
                      className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 text-center font-medium hover:bg-gray-50"
                  >
                      No, volver
                  </Link>
                  <button 
                      type="submit" 
                      className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                  >
                      Sí, Cancelar Pedido
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
}
