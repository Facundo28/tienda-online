
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { Eye, ShoppingBag, User, Truck, CreditCard, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
        user: true,
        courier: true 
    },
    take: 50 // Pagination later
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
       <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Ventas</h1>
                <p className="text-sm text-gray-500 mt-1">Historial completo, estados y asignaciones logísticas.</p>
            </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {orders.length === 0 ? (
            <div className="p-12 text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                   <ShoppingBag className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No hay ventas registradas</h3>
               <p className="text-gray-500 mt-1">Aún no se han realizado pedidos en la plataforma.</p>
           </div>
         ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">ID Pedido</th>
                            <th className="px-6 py-4">Comprador</th>
                            <th className="px-6 py-4">Conductor</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                                        #{order.id.slice(-8)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={order.user?.id ? `/admin/users/${order.user.id}` : '#'} className="flex items-center gap-3 group/user">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {order.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 group-hover/user:text-blue-600 transition-colors">{order.customerName}</div>
                                            <div className="text-[10px] text-gray-500">{order.customerEmail}</div>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    {order.courier ? (
                                        <Link href={`/admin/users/${order.courier.id}`} className="flex items-center gap-2 group/courier">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[10px]">
                                                {order.courier.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 group-hover/courier:text-orange-600 transition-colors">
                                                {order.courier.name}
                                            </span>
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Sin asignar</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {formatCurrencyFromCents(order.totalCents)}
                                </td>
                                <td className="px-6 py-4">
                                     <div className="flex flex-col gap-1">
                                         {/* PAGO */}
                                         <span className={`inline-flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 
                                            order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                                         }`}>
                                            <CreditCard className="w-3 h-3" />
                                            {order.status}
                                         </span>
                                         {/* ENVIO */}
                                         <span className={`inline-flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            ['DELIVERED', 'COMPLETED'].includes(order.deliveryStatus) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                                         }`}>
                                            <Truck className="w-3 h-3" />
                                            {order.deliveryStatus || 'PENDING'}
                                         </span>
                                     </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors shadow-sm">
                                        <Eye className="w-3 h-3 mr-1.5" />
                                        Gestionar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
         )}
       </div>
    </div>
  );
}
