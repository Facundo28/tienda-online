import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import Link from "next/link";
import { forceUpdateOrderStatus, forceUpdateDeliveryStatus } from "../actions";
import { ArrowLeft, Box, User, Truck, MapPin, CreditCard, DollarSign, ShieldAlert, Package, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      courier: true,
      items: {
        include: { 
            product: {
                include: { user: true } // Include seller
            } 
        }
      }
    }
  });

  if (!order) {
    return (
        <div className="p-12 text-center">
            <h2 className="text-xl font-bold text-gray-900">Pedido no encontrado</h2>
            <Link href="/admin/orders" className="text-blue-600 hover:underline mt-4 block">Volver al listado</Link>
        </div>
    );
  }

  // Derive primary seller (simplification: take the seller of the first item)
  const primarySeller = order.items[0]?.product?.user;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
         <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                   Pedido #{order.id.slice(-8)}
               </h1>
               <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-mono">
                   <span className="flex items-center gap-1"><Box className="w-3 h-3" /> {order.id}</span>
                   <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleString()}</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-2">
             <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                 order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
             }`}>
                 <CreditCard className="w-3 h-3" /> {order.status}
             </div>
             <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                 ['DELIVERED', 'COMPLETED'].includes(order.deliveryStatus) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
             }`}>
                 <Truck className="w-3 h-3" /> {order.deliveryStatus || 'PENDING'}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1: ITEMS & FINANCIALS (2/3) */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Products List */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Productos ({order.items.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-gray-50 transition-colors">
                             <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                                 {/* Image would go here */}
                                 <Package className="w-6 h-6 text-gray-300" />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <div className="font-bold text-gray-900 truncate">{item.product.name}</div>
                                 <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                     <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">ID: {item.productId.slice(-6)}</span>
                                     <span>Cantidad: <strong>{item.quantity}</strong></span>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="font-bold text-gray-900">{formatCurrencyFromCents(item.priceCents * item.quantity)}</div>
                                 <div className="text-xs text-gray-400">{formatCurrencyFromCents(item.priceCents)} c/u</div>
                             </div>
                             <Link href={`/admin/products/${item.productId}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver Producto">
                                 <Box className="w-4 h-4" />
                             </Link>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 p-6 flex justify-end">
                     <div className="w-full max-w-xs space-y-2">
                         <div className="flex justify-between text-sm text-gray-600">
                             <span>Subtotal</span>
                             <span>{formatCurrencyFromCents(order.totalCents)}</span>
                         </div>
                         <div className="flex justify-between text-sm text-gray-600">
                             <span>Envío</span>
                             <span>$0.00</span>
                         </div>
                         <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                             <span>Total</span>
                             <span>{formatCurrencyFromCents(order.totalCents)}</span>
                         </div>
                     </div>
                </div>
             </div>

             {/* Shipping Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-start gap-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                     <MapPin className="w-6 h-6" />
                 </div>
                 <div>
                     <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">Dirección de Entrega</h3>
                     <p className="text-gray-700">{order.shippingAddress || "Retiro en Punto de Venta"}</p>
                     {order.shippingCity && (
                         <p className="text-gray-500 text-sm">{order.shippingCity}, {order.shippingState} - {order.shippingZip}</p>
                     )}
                     <div className="mt-2 text-xs text-gray-400 font-mono">
                         Coords: {order.scanLatitude || 'N/A'}, {order.scanLongitude || 'N/A'}
                     </div>
                 </div>
            </div>

          </div>

          {/* COLUMN 3: PARTIES & ACTIONS (1/3) */}
          <div className="space-y-6">
              
              {/* Buyer Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-gray-500">Comprador</span>
                      {order.user && (
                          <Link href={`/admin/users/${order.user.id}`} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors font-bold">GOD MODE</Link>
                      )}
                  </div>
                  <div className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {order.customerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                          <div className="font-bold text-sm truncate" title={order.customerName}>{order.customerName}</div>
                          <div className="text-xs text-gray-500 truncate" title={order.customerEmail}>{order.customerEmail}</div>
                          <div className="text-xs text-gray-500">{order.customerPhone || 'Sin teléfono'}</div>
                      </div>
                  </div>
              </div>

               {/* Seller Card (Primary) */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-gray-500">Vendedor Principal</span>
                      {primarySeller && (
                          <Link href={`/admin/users/${primarySeller.id}`} className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded hover:bg-purple-200 transition-colors font-bold">GOD MODE</Link>
                      )}
                  </div>
                  <div className="p-4 flex items-center gap-3">
                       {primarySeller ? (
                           <>
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                    {primarySeller.name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-sm truncate">{primarySeller.name || 'Desconocido'}</div>
                                    <div className="text-xs text-gray-500 truncate">{primarySeller.email}</div>
                                </div>
                           </>
                       ) : (
                           <div className="text-sm text-gray-400 italic">No identificado</div>
                       )}
                  </div>
              </div>

               {/* Courier Card */}
               <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-gray-500">Repartidor</span>
                      {order.courier && (
                          <Link href={`/admin/users/${order.courier.id}`} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded hover:bg-orange-200 transition-colors font-bold">GOD MODE</Link>
                      )}
                  </div>
                  <div className="p-4 flex items-center gap-3">
                       {order.courier ? (
                           <>
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                    {order.courier.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-sm truncate">{order.courier.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{order.courier.email}</div>
                                </div>
                           </>
                       ) : (
                           <div className="text-sm text-gray-400 italic flex items-center gap-2">
                               <Truck className="w-4 h-4" /> Sin asignar
                           </div>
                       )}
                  </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-red-50 p-5 rounded-xl border border-red-100 space-y-4">
                <h3 className="text-xs font-bold text-red-800 uppercase flex items-center gap-2 border-b border-red-200 pb-2">
                    <ShieldAlert className="w-3 h-3" />
                    Zona de Control
                </h3>
                
                <form action={async (formData) => {
                    "use server"
                    await forceUpdateOrderStatus(id, formData.get("status") as string)
                }} className="space-y-2">
                    <label className="block text-[10px] font-bold text-red-700 uppercase">Forzar Estado Pago</label>
                    <div className="flex gap-2">
                        <select name="status" defaultValue={order.status} className="flex-1 text-xs rounded border-red-200 bg-white p-1.5 focus:ring-red-500 focus:border-red-500">
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                            <option value="DISPUTED">DISPUTED</option>
                        </select>
                        <button type="submit" className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 font-bold">
                            OK
                        </button>
                    </div>
                </form>

                <form action={async (formData) => {
                    "use server"
                    await forceUpdateDeliveryStatus(id, formData.get("status") as string)
                }} className="space-y-2">
                    <label className="block text-[10px] font-bold text-red-700 uppercase">Forzar Estado Envío</label>
                    <div className="flex gap-2">
                        <select name="status" defaultValue={order.deliveryStatus || "PENDING"} className="flex-1 text-xs rounded border-red-200 bg-white p-1.5 focus:ring-red-500 focus:border-red-500">
                            <option value="PENDING">PENDING</option>
                            <option value="READY_TO_PICKUP">READY_TO_PICKUP</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="ON_WAY">ON_WAY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="FAILED">FAILED</option>
                        </select>
                        <button type="submit" className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 font-bold">
                            OK
                        </button>
                    </div>
                </form>
             </div>

          </div>

      </div>
    </div>
  );
}
