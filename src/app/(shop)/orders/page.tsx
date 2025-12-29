import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import { PickupQrCode } from "@/components/PickupQrCode";
import { DownloadInvoiceButton } from "@/components/DownloadInvoiceButton";
import { ClaimButton } from "@/components/ClaimButton";
import { DeliveryMethod } from "@/generated/prisma/enums";
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      claim: { select: { id: true, status: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
              user: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  function getFirstImage(raw: string | null) {
    if (!raw) return null;
    return raw.split(/[\n,]+/)[0]?.trim();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'SHIPPED': 
      case 'ON_WAY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PAID': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  function getStatusLabel(status: string) {
      const map: Record<string, string> = {
          'PENDING': 'Pendiente',
          'PAID': 'Pagado',
          'SHIPPED': 'Enviado',
          'ON_WAY': 'En Camino',
          'DELIVERED': 'Entregado',
          'CANCELLED': 'Cancelado',
      };
      return map[status] || status;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-[#12753e]" />
            Mis Compras
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus pedidos y revisa el estado de tus envíos.
          </p>
        </div>
        <Link
          href="/products"
          className="bg-[#12753e] hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-full transition-colors shadow-sm flex items-center gap-2"
        >
          Ir a la tienda <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <Package className="w-12 h-12 text-gray-300" />
            </div>
          <h3 className="text-lg font-semibold text-gray-900">Aún no tienes compras</h3>
          <p className="text-gray-500 max-w-sm mt-2 mb-8">
            Explora nuestro catálogo y encuentra los mejores productos al mejor precio.
          </p>
          <Link
            href="/products"
            className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md"
          >
            Empezar a comprar
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                <div className="flex flex-wrap gap-6 text-sm">
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Package className="w-3 h-3" /> Pedido
                      </span>
                      <span className="font-mono font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Fecha
                      </span>
                      <span className="text-gray-700">{order.createdAt.toLocaleDateString("es-AR")}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                           <CreditCard className="w-3 h-3" /> Total
                      </span>
                      <span className="font-bold text-gray-900">{formatCurrencyFromCents(order.totalCents)}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                      {getStatusLabel(order.status)}
                   </span>
                   {order.claim && (
                       <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                           ⚠️ Reclamo {order.claim.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                       </span>
                   )}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-8">
                      {/* Items List */}
                      <div className="flex-1 space-y-6">
                          {order.items.map((item: any) => (
                              <div key={item.id} className="flex gap-4">
                                  <div className="w-20 h-20 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0">
                                      <img
                                          src={getFirstImage(item.product.imageUrl) ?? "https://placehold.co/100?text=IMG"}
                                          alt={item.product.name}
                                          className="w-full h-full object-cover"
                                      />
                                  </div>
                                  <div>
                                      <h4 className="font-medium text-gray-900 line-clamp-2">{item.product.name}</h4>
                                      <p className="text-sm text-gray-500 mt-1">Vendedor: {item.product.user?.name || "Market Online"}</p>
                                      <p className="text-sm font-semibold text-[#12753e] mt-1">
                                          {item.quantity} x {formatCurrencyFromCents(item.priceCents)}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Actions & QR */}
                      <div className="lg:w-72 flex flex-col gap-4 border-l pl-0 lg:pl-8 lg:border-gray-100">
                          <div className="flex flex-col gap-2">
                              <Link 
                                  href={`/orders/${order.id}`}
                                  className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
                              >
                                  Ver Detalle Completo
                              </Link>
                              
                              <DownloadInvoiceButton order={order} />
                              
                              <ClaimButton 
                                  orderId={order.id} 
                                  hasClaim={!!order.claim} 
                                  orderStatus={order.status}
                              />
                          </div>

                          {order.deliveryMethod === DeliveryMethod.PICKUP && order.pickupCode && (
                              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 text-center mt-auto">
                                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
                                      <MapPin className="w-3 h-3" /> Código de Retiro
                                  </div>
                                  <div className="text-2xl font-mono font-bold tracking-widest text-[#12753e] mb-3">
                                      {order.pickupCode}
                                  </div>
                                  <div className="flex justify-center">
                                      <PickupQrCode
                                          orderId={order.id}
                                          pickupCode={order.pickupCode}
                                          buyerName={order.customerName}
                                          sellerName={order.items[0]?.product.user?.name || "Tienda"}
                                      />
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
