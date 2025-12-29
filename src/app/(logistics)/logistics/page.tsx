import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UnassignedOrders } from "./UnassignedOrders";
import { createWorkerAction } from "./actions";
import { ShoppingBag, Package, UserPlus, Users, Truck, Wallet, ChevronRight, MoreVertical, TrendingUp, Map as MapIcon, Home } from "lucide-react";
import { RevenueChart } from "@/components/logistics/RevenueChart";
import { startOfDay, subDays, format, subMinutes, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { FleetMapWrapper } from "@/components/logistics/FleetMapWrapper";
import { CreateWorkerModal } from "@/components/logistics/CreateWorkerModal";
import { WorkerListActions } from "@/components/logistics/WorkerListActions";
import { AlertsCenter } from "@/components/logistics/AlertsCenter";

export default async function LogisticsDashboard() {
  const user = await requireUser();

  if (user.role !== UserRole.LOGISTICS_ADMIN && user.role !== UserRole.ADMIN) {
     redirect("/");
  }

  const company = await prisma.logisticsCompany.findUnique({
      where: { ownerId: user.id },
      include: { 
          workers: {
              orderBy: { createdAt: 'desc' },
              include: { assignedOrders: { where: { deliveryStatus: 'ON_WAY' } } }
          }
      }
  });

  if (!company) {
      return (
          <div className="p-10 text-center">
              <h1 className="text-2xl font-bold text-red-600">No tienes una empresa registrada</h1>
              <p>Contacta a soporte para dar de alta tu flota.</p>
          </div>
      );
  }

   // 1. Unassigned Orders
   const unassignedOrders = await prisma.order.findMany({
       where: {
           deliveryMethod: 'DELIVERY', 
           deliveryStatus: 'PENDING',  
           courierId: null             
       },
       orderBy: { createdAt: 'asc' }
   });

   // 2. Revenue Data (Last 7 Days)
   const today = new Date();
   const sevenDaysAgo = subDays(today, 6);
   
   const weeklyDeliveries = await prisma.order.findMany({
       where: {
           deliveryStatus: 'DELIVERED',
           deliveryTime: { gte: startOfDay(sevenDaysAgo) },
           courier: { workerOfId: company.id } // Only my company's deliveries
       },
       select: { totalCents: true, deliveryTime: true }
   });
   
   // Aggregate by day
   // Create array of last 7 days names
   const chartData = Array.from({ length: 7 }).map((_, i) => {
       const d = subDays(today, 6 - i); // Chronological
       const dayKey = format(d, 'yyyy-MM-dd');
       const dayLabel = format(d, 'EEE', { locale: es }); // "lun", "mar"
       
       // Sum totals for this day
       const total = weeklyDeliveries
           .filter((o: any) => o.deliveryTime && format(o.deliveryTime, 'yyyy-MM-dd') === dayKey)
           .reduce((acc: number, curr: any) => acc + curr.totalCents, 0);
           
       return { name: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1), total };
       return { name: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1), total };
   });

   // 3. Real All-Time Revenue
   const allTimeRevenue = await prisma.order.aggregate({
       where: {
           deliveryStatus: 'DELIVERED',
           courier: { workerOfId: company.id }
       },
       _sum: { totalCents: true }
   });

   const totalRealRevenue = allTimeRevenue._sum.totalCents || 0;

   // Calculate real stats
   const totalDrivers = company.workers.length;
   const activeDrivers = company.workers.filter(w => w.isActive).length;

   // 4. Alerts Logic (Real Time)
   const thirtyMinutesAgo = subMinutes(today, 30);
   const fortyFiveMinutesAgo = subMinutes(today, 45);

   const criticalOrders = await prisma.order.findMany({
       where: {
           deliveryStatus: 'PENDING',
           createdAt: { lt: thirtyMinutesAgo },
           deliveryMethod: 'DELIVERY'
       },
       take: 5
   });

   const warningOrders = await prisma.order.findMany({
        where: {
            deliveryStatus: 'ON_WAY',
            updatedAt: { lt: fortyFiveMinutesAgo },
            courier: { workerOfId: company.id }
        },
        take: 5
   });

   const alerts = [
       ...criticalOrders.map(o => ({
           id: `crit-${o.id}`,
           type: "critical" as const,
           title: "Demora en Despacho",
           message: `Pedido #${o.id.slice(-4)} pendiente hace ${formatDistanceToNow(o.createdAt, { locale: es })}`,
           time: format(o.createdAt, 'HH:mm')
       })),
       ...warningOrders.map(o => ({
           id: `warn-${o.id}`,
           type: "warning" as const,
           title: "Demora en Entrega",
           message: `Pedido #${o.id.slice(-4)} en camino hace ${formatDistanceToNow(o.updatedAt, { locale: es })}`,
           time: format(o.updatedAt, 'HH:mm')
       }))
   ];

   return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
       {/* Cabecera Premium */}
       <header className="bg-gradient-to-br from-[#12753e] to-[#0e5c30] text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-50" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                    <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{company.name}</h1>
                    <div className="flex items-center gap-6 md:gap-8">
                        <div>
                            <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">Balance Total</p>
                            <p className="text-3xl font-bold font-mono">${(totalRealRevenue / 100).toLocaleString('es-AR')}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10"></div>
                        <div>
                             <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">Flota Activa</p>
                             <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold">{activeDrivers}</span>
                                <span className="text-sm opacity-50 font-medium">/ {totalDrivers}</span>
                             </div>
                        </div>
                    </div>
               </div>
               
               <div className="flex gap-3">
                    <Link href="/" className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center" title="Ir a la Tienda">
                        <Home className="w-6 h-6" />
                    </Link>
                    <Link href="/logistics/settings" className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center" title="Configuración">
                        <MoreVertical className="w-6 h-6" />
                    </Link>
               </div>
           </div>
       </header>

       {/* Grid: Map, Graphs & Alerts */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Fleet Map */}
           <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100 h-[350px] relative">
               <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-xs font-bold text-gray-700">En Vivo</span>
               </div>
               <FleetMapWrapper drivers={company.workers} />
           </div>

           {/* Revenue Chart */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[350px] flex flex-col">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-green-600" />
                       Ingresos (7d)
                   </h3>
               </div>
               <div className="flex-1">
                   <RevenueChart data={chartData} />
               </div>
           </div>

           {/* Alerts Center */}
           <div className="h-[350px]">
               <AlertsCenter alerts={alerts} />
           </div>
       </div>

       {/* Main Content Grid: Orders & Workers */}
       <div className="grid lg:grid-cols-2 gap-6">
           {/* Unassigned Orders */}
           <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
               <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <Package className="w-5 h-5" />
                       </div>
                       Despacho
                       <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold border border-yellow-200">{unassignedOrders.length}</span>
                   </h2>
               </div>
               
               <UnassignedOrders 
                    orders={unassignedOrders} 
                    drivers={company.workers} 
               />
           </section>

           {/* Workers List Mini */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        Conductores
                    </h3>
                    <Link href="/logistics/drivers" className="text-sm font-medium text-[#12753e] hover:underline flex items-center gap-1">
                        Ver Lista <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {company.workers.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No hay conductores.</p>
                ) : (
                    <div className="space-y-4">
                        {company.workers.slice(0, 5).map((worker: any) => (
                            <div key={worker.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                                        {worker.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{worker.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                {worker.isActive ? (
                                                    <span className="text-green-600 flex items-center gap-1">● Online</span>
                                                ) : (
                                                    <span className="text-gray-400">● Offline</span>
                                                )}
                                            </p>
                                            {worker.vehiclePlate && (
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded uppercase font-mono border border-gray-200">
                                                    {worker.vehiclePlate}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        {worker.assignedOrders.length > 0 ? (
                                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                                                {worker.assignedOrders.length} envíos
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-gray-300">Libre</span>
                                        )}
                                    </div>
                                    <WorkerListActions workerId={worker.id} isActive={worker.isActive} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <CreateWorkerModal />
           </div>
       </div>
    </div>
  );
}
