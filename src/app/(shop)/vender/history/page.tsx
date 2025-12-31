import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import Link from "next/link";
import { Package, XCircle, Search, Calendar, ChevronRight } from "lucide-react";

export default async function SellerSalesHistoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const user = await requireUser();
  const { filter } = await searchParams; // 'all', 'cancelled', 'completed'

  // Fetch orders where this user is the seller of at least one item
  const sales = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            userId: user.id
          }
        }
      },
      // Optional: Filter logic
      // status: filter === 'cancelled' ? 'CANCELLED' : undefined
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        where: {
             product: { userId: user.id } // Only fetch items sold by this user
        },
        include: {
          product: true
        }
      },
      user: { select: { name: true, email: true } }, // Buyer info
    }
  });

  return (
    <div className="max-w-[1248px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Package className="w-6 h-6 text-[#12753e]" />
             Mis Vendidos
           </h1>
           <p className="text-gray-500 text-sm">Historial de ventas, devoluciones y reclamos.</p>
        </div>
        
        {/* Simple Filter Tabs */}
        {/* For now just a list, maybe tabs later if complex */}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         {sales.length === 0 ? (
             <div className="p-12 text-center text-gray-400">
                 No tienes ventas registradas aún.
             </div>
         ) : (
             <div className="divide-y divide-gray-100">
                 {sales.map((sale: any) => (
                     <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 justify-between">
                         <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-sm font-bold text-gray-700">#{sale.id.slice(-8).toUpperCase()}</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {sale.createdAt.toLocaleDateString()}
                                </span>
                                {sale.status === 'CANCELLED' && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Cancelada</span>
                                )}
                                {sale.status === 'DELIVERED' && (
                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Entregada</span>
                                )}
                             </div>
                             
                             {/* Items */}
                             <div className="space-y-1">
                                 {sale.items.map((item: any) => (
                                     <div key={item.id} className="flex items-center gap-2 text-sm">
                                         <span className="font-medium text-gray-900">{item.quantity}x {item.product.name}</span>
                                     </div>
                                 ))}
                             </div>
                             
                             {/* Buyer Info */}
                             <div className="mt-2 text-xs text-gray-500">
                                 Comprador: <span className="font-medium text-gray-700">{sale.user?.name || "Usuario"}</span>
                             </div>
                         </div>
                         
                         <div className="flex flex-col items-end gap-2 text-right">
                             <span className="font-bold text-gray-900 text-lg">
                                 {formatCurrencyFromCents(sale.totalCents)}
                             </span>
                             <Link 
                                href={`/orders/${sale.id}/chat`}
                                className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
                             >
                                 Ver Detalle / Chat <ChevronRight className="w-4 h-4" />
                             </Link>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
}
