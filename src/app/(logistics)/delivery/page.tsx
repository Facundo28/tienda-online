import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole, DeliveryStatus } from "@/generated/prisma/enums";
import Link from "next/link";
import { formatCurrencyFromCents } from "@/lib/money";
import { AvailableOrdersSection } from "./AvailableOrders";
import { ShoppingBag, Package } from "lucide-react";

export default async function DeliveryDashboard() {
  const user = await requireUser();

  // Enforce Driver Role (or Admin/Logistics Admin)
  if (user.role !== UserRole.DRIVER && user.role !== UserRole.LOGISTICS_ADMIN && user.role !== UserRole.ADMIN) {
      return (
          <div className="text-center py-10">
              <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
              <p>Esta área es exclusiva para repartidores autorizados.</p>
          </div>
      );
  }

  // Get Assigned Orders
  // For MVP, if Admin, show all pending deliveries? Or just show assigned ones?
  // Let's show assigned ones OR unassigned ones (for pickup)?
  // For now: Show orders assigned to THIS user (`courierId`).
  const myDeliveries = await prisma.order.findMany({
      where: {
          courierId: user.id,
          deliveryStatus: { not: DeliveryStatus.DELIVERED },
      },
      include: {
          items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Resumen Flotante (Earnings / Status) */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex justify-between items-center mx-1 relative z-10">
          <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tu Jornada</p>
              <h2 className="text-2xl font-bold text-gray-900">
                  {formatCurrencyFromCents(0)}
              </h2>
          </div>
          <div className="flex gap-3">
              <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Entregados</p>
                  <p className="font-bold text-lg text-green-600">0</p>
              </div>
              <div className="w-px bg-gray-100"></div>
              <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Puntos</p>
                  <p className="font-bold text-lg text-blue-600">0</p>
              </div>
          </div>
      </div>

      {/* 2. Available Orders (Pool) - Logic: Orders without courier */}
      <AvailableOrdersSection />

      {/* Sección: Mis Envíos Activos */}
      <section>
          <div className="flex items-center gap-2 mb-4 px-1">
              <h2 className="font-bold text-gray-700 text-lg">Tu mochila</h2>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">
                  {myDeliveries.length}
              </span>
          </div>
          
          {myDeliveries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 mx-1">
                  <div className="mb-2 opacity-50 flex justify-center">
                      <Package className="w-12 h-12" />
                  </div>
                  <h3 className="font-bold text-gray-400">Sin envíos activos</h3>
                  <p className="text-sm text-gray-400 mt-1">Acepta pedidos del mapa para empezar.</p>
              </div>
          ) : (
              <div className="grid gap-3 px-1">
                  {myDeliveries.map((order: any) => (
                      <Link href={`/delivery/orders/${order.id}`} key={order.id} className="block group">
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] relative overflow-hidden">
                            {/* Status Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.deliveryStatus === 'ON_WAY' ? 'bg-green-500' : 'bg-orange-400'}`} />
                            
                            <div className="pl-3 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                            order.deliveryStatus === 'ON_WAY' 
                                            ? 'bg-green-50 text-green-700' 
                                            : 'bg-orange-50 text-orange-700'
                                        }`}>
                                            {order.deliveryStatus === 'ON_WAY' ? 'En Camino' : 'Asignado'}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">#{order.id.slice(-4)}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{order.customerName}</h3>
                                    <p className="text-gray-500 text-sm truncate w-56 mt-0.5">{order.addressLine1}</p>
                                </div>
                                <div className="flex flex-col items-end justify-center h-full">
                                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                          <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                                        </svg>
                                     </div>
                                </div>
                            </div>
                        </div>
                      </Link>
                  ))}
              </div>
          )}
      </section>
    </div>
  );
}
