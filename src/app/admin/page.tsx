import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  Package,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Fetch Basic Counts
  const [
    usersCount,
    ordersCount,
    productsCount,
    openClaimsCount,
    recentOrders,
    recentUsers,
    ordersLast7Days
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.claim.count({ where: { status: "OPEN" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
    // Fetch orders for chart
    prisma.order.findMany({
        where: { 
            createdAt: { gte: sevenDaysAgo },
            status: { not: 'CANCELLED' } 
        },
        select: { createdAt: true, totalCents: true }
    })
  ]);

  // 2. Calculate Total Revenue (All time)
  const totalRevenueAgg = await prisma.order.aggregate({
    _sum: { totalCents: true },
    where: { status: "PAID" }
  });
  const totalRevenue = totalRevenueAgg._sum.totalCents || 0;

  // 3. Process Chart Data (Real 7 Days)
  const chartMap = new Map<string, number>();
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-ES', { weekday: 'short' }); // e.g. "lun"
      chartMap.set(key, 0);
  }
  // Fill with data
  ordersLast7Days.forEach(o => {
      const key = o.createdAt.toLocaleDateString('es-ES', { weekday: 'short' });
      const current = chartMap.get(key) || 0;
      chartMap.set(key, current + (o.totalCents / 100)); // Convert to currency units
  });
  const chartData = Array.from(chartMap.entries()).map(([name, total]) => ({ name, total }));

  // 4. Top Selling Products (Real Aggregation)
  // SQLite/Prisma GroupBy
  const topItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, priceCents: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
  });
  
  // Fetch product details for top items
  const productIds = topItems.map(i => i.productId);
  const productsMap = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, imageUrl: true }
  });
  
  const topProducts = topItems.map(item => {
      const p = productsMap.find(pm => pm.id === item.productId);
      return {
          id: item.productId,
          name: p?.name || "Producto Desconocido",
          imageUrl: p?.imageUrl,
          sold: item._sum.quantity || 0,
          revenue: item._sum.priceCents || 0
      };
  });


  const stats = [
    {
      label: "Ingresos Totales",
      value: formatCurrencyFromCents(totalRevenue),
      icon: CreditCard,
      change: "+ --", // Needs historical comparison for real value
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Usuarios Totales",
      value: usersCount.toString(),
      icon: Users,
      change: `+${recentUsers.length} esta semana`, 
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "Pedidos Totales",
      value: ordersCount.toString(),
      icon: ShoppingBag,
      change: `+${ordersLast7Days.length} últimos 7 días`,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Reclamos Abiertos",
      value: openClaimsCount.toString(),
      icon: AlertCircle,
      change: openClaimsCount > 0 ? "Acción requerida" : "Sin pendientes",
      color: openClaimsCount > 0 ? "text-red-600" : "text-gray-600",
      bg: openClaimsCount > 0 ? "bg-red-50" : "bg-gray-50"
    }
  ];

  function firstImageUrl(raw: string | null) {
    if (!raw) return null;
    return raw.split(',')[0].trim();
  }

  return (
    <div className="space-y-8 fade-in">
      {/* HEADER INFO */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Resumen Ejecutivo</h1>
        <p className="text-gray-500">Vista general del rendimiento de tu tienda en tiempo real.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
           const Icon = stat.icon;
           return (
             <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#12753e]/30 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <h3 className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <Icon className={stat.color} size={24} />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-gray-500">
                    <span className={`inline-flex items-center ${stat.change.includes('+') || stat.change.includes('Acción') ? 'text-green-600' : ''}`}>
                       {stat.change}
                    </span>
                </div>
             </div>
           )
        })}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
         
         {/* LEFT COLUMN (2/3) */}
         <div className="lg:col-span-2 space-y-6">
            {/* CHART */}
            <DashboardCharts data={chartData} />

            {/* TOP PRODUCTS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Productos Más Vendidos</h3>
                    <Link href="/admin/products" className="text-xs font-medium text-[#12753e] hover:underline">Ver inventario</Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {topProducts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">No hay suficientes datos de ventas aún.</div>
                    ) : (
                        topProducts.map((p) => (
                            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0">
                                        {firstImageUrl(p.imageUrl) ? (
                                            <Image src={firstImageUrl(p.imageUrl) ?? ""} alt={p.name} fill className="object-cover" />
                                        ) : <Package className="w-6 h-6 m-auto text-gray-400" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.sold} unidades vendidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-sm">{formatCurrencyFromCents(p.revenue)}</p>
                                    <p className="text-xs text-green-600 font-medium">Ingresos</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
         </div>

         {/* RIGHT COLUMN (1/3) */}
         <div className="space-y-6">
             {/* RECENT USERS */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Nuevos Usuarios</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentUsers.map(u => (
                        <div key={u.id} className="p-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
             </div>

             {/* RECENT ORDERS MINI (Detailed) */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Últimos Pedidos</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentOrders.length === 0 ? (
                         <div className="p-6 text-center text-gray-500 text-sm">Sin pedidos.</div>
                    ) : (
                        recentOrders.map(order => (
                            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-xs text-gray-500">#{order.id.slice(-4)}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                        order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 group-hover:text-[#12753e] transition-colors">{order.customerName}</p>
                                <div className="mt-2 flex justify-between items-center text-xs">
                                    <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="font-semibold">{formatCurrencyFromCents(order.totalCents)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                 <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <Link href="/admin/orders" className="text-xs font-medium text-[#12753e] hover:underline flex justify-center items-center">
                        Ver todos los pedidos <ArrowRight size={12} className="ml-1"/>
                    </Link>
                </div>
             </div>
         </div>

      </div>
    </div>
  );
}
