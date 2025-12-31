import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole, DeliveryStatus } from "@/generated/prisma/enums";
import Link from "next/link";
import { formatCurrencyFromCents } from "@/lib/money";
import { AvailableOrdersSection } from "./AvailableOrders";
import { ShoppingBag, Package, MapPin, CheckCircle, Navigation, Trophy, Star, Zap, Clock } from "lucide-react";
import { startOfDay, subDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { RevenueChart } from "@/components/logistics/RevenueChart";

export default async function DeliveryDashboard() {
  const user = await requireUser();

  if (user.role !== UserRole.DRIVER && user.role !== UserRole.LOGISTICS_ADMIN && user.role !== UserRole.ADMIN) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
              <p className="text-gray-500 max-w-sm">Esta área es exclusiva para repartidores verificados de Market E.C.</p>
              <Link href="/" className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold">Volver al Inicio</Link>
          </div>
      );
  }

  // 1. Stats
  const deliveredCount = await prisma.order.count({
      where: {
          courierId: user.id,
          deliveryStatus: DeliveryStatus.DELIVERED
      }
  });

  // 2. Active Deliveries
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

  // Real Earnings Aggregation
  const totalEarnings = await prisma.order.aggregate({
      where: { 
          courierId: user.id, 
          deliveryStatus: 'DELIVERED' 
      },
      _sum: { totalCents: true }
  });
  const estimatedEarnings = totalEarnings._sum.totalCents || 0;

  // 3. Weekly Data
  const today = new Date();
  const sevenDaysAgo = subDays(today, 6);
  
  const weeklyDeliveries = await prisma.order.findMany({
      where: {
          courierId: user.id,
          deliveryStatus: 'DELIVERED',
          deliveryTime: { gte: startOfDay(sevenDaysAgo) }
      },
      select: { totalCents: true, deliveryTime: true }
  });

  const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(today, 6 - i);
      const dayKey = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE', { locale: es });
      
      const total = weeklyDeliveries
          .filter((o: any) => o.deliveryTime && format(o.deliveryTime, 'yyyy-MM-dd') === dayKey)
          .reduce((acc: number, curr: any) => acc + curr.totalCents, 0);
          
      return { name: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1), total };
  });

  // 4. Today's Timeline
  const todaysDeliveries = await prisma.order.findMany({
      where: {
          courierId: user.id,
          deliveryStatus: 'DELIVERED',
          deliveryTime: { gte: startOfDay(today) }
      },
      orderBy: { deliveryTime: 'desc' },
      include: { items: true }
  });

  // 5. Gamification Logic
  const totalGenerado = deliveredCount * 1500; // XP Base
  const currentLevel = 
      deliveredCount < 20 ? { name: "Novato", min: 0, max: 20, color: "text-gray-200", icon: CheckCircle } :
      deliveredCount < 100 ? { name: "Profesional", min: 20, max: 100, color: "text-blue-300", icon: Zap } :
      deliveredCount < 500 ? { name: "Experto", min: 100, max: 500, color: "text-yellow-300", icon: Star } :
      { name: "Leyenda", min: 500, max: 10000, color: "text-purple-300", icon: Trophy };

  const nextLevelDiff = currentLevel.max - currentLevel.min;
  const currentProgress = deliveredCount - currentLevel.min;
  const progressPercent = Math.min(100, Math.max(0, (currentProgress / nextLevelDiff) * 100));

  return (
    <div className="space-y-8 pb-24">
      
      {/* Header / Gamification Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#12753e] text-white shadow-xl shadow-green-900/10 mx-1">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 p-6">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <currentLevel.icon className={`w-5 h-5 ${currentLevel.color}`} />
                          <span className={`text-sm font-bold uppercase tracking-wider ${currentLevel.color}`}>{currentLevel.name}</span>
                      </div>
                      <h2 className="text-4xl font-black tracking-tight leading-none">
                          {formatCurrencyFromCents(estimatedEarnings)}
                      </h2>
                      <p className="text-green-100 text-xs mt-1 opacity-80">Ganancias Totales Estimadas</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                      <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
              </div>

              {/* XP Bar */}
              <div className="mb-6">
                  <div className="flex justify-between text-xs font-medium text-green-100 mb-1.5 opacity-90">
                      <span>Nivel {Math.floor(deliveredCount / 10) + 1}</span>
                      <span>{deliveredCount} / {currentLevel.max} Envíos</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <div className="h-full bg-white transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <p className="text-[10px] text-green-200 mt-1.5 text-center font-medium">
                      ¡Faltan {currentLevel.max - deliveredCount} envíos para el siguiente rango!
                  </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-green-200">
                          <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-2xl font-bold leading-none">{deliveredCount}</p>
                          <p className="text-[10px] text-green-100 font-bold uppercase tracking-wider mt-1">Entregados</p>
                      </div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-200">
                          <Navigation className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-2xl font-bold leading-none">{myDeliveries.length}</p>
                          <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider mt-1">En Curso</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Chart Section */}
      <section className="px-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[300px] flex flex-col">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                   <Zap className="w-4 h-4 text-yellow-500" />
                   Rendimiento Semanal
               </h3>
               <div className="flex-1 -ml-4">
                   <RevenueChart data={chartData} />
               </div>
          </div>
      </section>

      {/* Available Pool */}
      <AvailableOrdersSection />

      {/* Today's Timeline */}
      {todaysDeliveries.length > 0 && (
          <section className="px-1">
              <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                      <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900">Tu Jornada de Hoy</h3>
              </div>
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-8 w-px bg-gray-100 z-0"></div>
                  
                  <div className="space-y-6 relative z-10">
                      {todaysDeliveries.map((order: any, index: number) => (
                          <div key={order.id} className="flex gap-4 group">
                              <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm flex-shrink-0 mt-1 relative z-10 ring-1 ring-gray-100"></div>
                              <div className="flex-1 pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-start">
                                      <p className="font-bold text-gray-900 text-sm">Entrega #{order.id.slice(-4)}</p>
                                      <span className="text-xs font-mono text-gray-400">
                                          {order.deliveryTime ? format(order.deliveryTime, 'HH:mm') : '--:--'}
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                      {order.addressLine1}
                                  </p>
                                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                      +$1.500
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>
      )}

      {/* Active Backpack */}
      <section className="px-1">
          <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#12753e] rounded-full"></span>
                  Tu Mochila
              </h2>
          </div>
          
          {myDeliveries.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <Package className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Mochila vacía</h3>
                  <p className="text-sm text-gray-500">
                      No tienes pedidos asignados actualmente. <br/>
                      Revisa el mapa para tomar nuevos envíos.
                  </p>
              </div>
          ) : (
              <div className="space-y-4">
                  {myDeliveries.map((order: any) => (
                      <Link href={`/delivery/orders/${order.id}`} key={order.id} className="block group">
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all active:scale-[0.98] relative overflow-hidden">
                            {/* Status Indicator */}
                            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider ${
                                order.deliveryStatus === 'ON_WAY' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                                {order.deliveryStatus === 'ON_WAY' ? 'En Camino' : 'Preparando'}
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-400 mt-1">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 truncate">
                                        {order.customerName}
                                    </h4>
                                    <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-3">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#12753e]" />
                                        <span className="line-clamp-2 leading-snug">{order.addressLine1}, {order.city}</span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600">
                                            #{order.id.slice(-4)}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                                            $1.500
                                        </span>
                                    </div>
                                </div>
                                <div className="self-center pl-2">
                                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#12753e] group-hover:text-white transition-all">
                                         <Navigation className="w-5 h-5" />
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
