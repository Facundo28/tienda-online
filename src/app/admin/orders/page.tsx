
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 50 // Pagination later
  });

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Ventas</h1>
                <p className="text-sm text-gray-500">Historial completo de pedidos.</p>
            </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b">
                    <tr>
                        <th className="px-6 py-4 font-semibold">ID Pedido</th>
                        <th className="px-6 py-4 font-semibold">Comprador</th>
                        <th className="px-6 py-4 font-semibold">Fecha</th>
                        <th className="px-6 py-4 font-semibold">Total</th>
                        <th className="px-6 py-4 font-semibold">Estado de Pago</th>
                        <th className="px-6 py-4 font-semibold">Envío</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-500">No hay ventas registradas.</td></tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-mono text-xs">{order.id.slice(-8)}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{order.customerName}</div>
                                    <div className="text-xs text-gray-500">{order.user?.email || order.customerEmail}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">{formatCurrencyFromCents(order.totalCents)}</td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                        order.status === 'PAID' ? 'bg-green-50 text-green-700' : 
                                        order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-700'
                                     }`}>
                                        {order.status}
                                     </span>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                        order.deliveryStatus === 'DELIVERED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                                     }`}>
                                        {order.deliveryStatus || 'PENDING'}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/admin/orders/${order.id}`} className="text-[#12753e] hover:underline text-xs font-medium">
                                        Ver Detalle
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
       </div>
    </div>
  );
}
