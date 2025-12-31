import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldAlert, BadgeDollarSign, Tag, Package, Box, ShoppingCart, User as UserIcon, Calendar, Star, MessageCircle, AlertCircle } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/money";
import { ProductEditForm } from "./ProductEditForm";
import { BoostProductButton } from "../BoostProductButton";
import { deleteProduct, toggleProduct } from "../actions";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      user: true,
      _count: {
        select: {
          favorites: true,
          questions: true,
          reviews: true,
          orderItems: true
        }
      }
    }
  });

  if (!product) notFound();

  // Fetch recent orders containing this product
  const recentOrderItems = await prisma.orderItem.findMany({
    where: { productId: product.id },
    take: 10,
    orderBy: { order: { createdAt: 'desc' } },
    include: {
        order: {
            include: { user: true }
        }
    }
  });

  const isBoosted = !!(product.boostedUntil && new Date(product.boostedUntil) > new Date());

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                       {product.name}
                       {isBoosted && <div className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">Boost Ativo</div>}
                       {!product.isActive && <div className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Inactivo</div>}
                   </h1>
                   <p className="text-gray-500 flex items-center gap-2 text-sm mt-1 font-mono">
                       <Box className="w-3 h-3" /> {product.id}
                   </p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                 <BoostProductButton productId={product.id} isBoosted={isBoosted} />
                 
                 <form action={async () => {
                     "use server";
                     await toggleProduct(product.id, !product.isActive);
                 }}>
                     <button className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${product.isActive ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>
                         {product.isActive ? 'Pausar Publicación' : 'Activar Publicación'}
                     </button>
                 </form>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMN 1: EDIT FORM (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <Tag className="w-5 h-5 text-blue-600" />
                        Editar Información
                    </h2>
                    <ProductEditForm product={product} />
                </section>
            </div>

            {/* COLUMN 2: SIDEBAR (1/3) */}
            <div className="space-y-6">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                         <div className="text-gray-500 text-xs font-bold uppercase mb-1">Precio</div>
                         <div className="text-xl font-bold text-gray-900">{formatCurrencyFromCents(product.priceCents)}</div>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                         <div className="text-gray-500 text-xs font-bold uppercase mb-1">Stock</div>
                         <div className="text-xl font-bold text-gray-900">{product.stock || 1}</div>
                     </div>
                </div>

                {/* Engagement Stats */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase">Interacción</h3>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Star className="w-4 h-4 text-yellow-500" /> Favoritos
                        </div>
                        <span className="font-bold">{product._count.favorites}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MessageCircle className="w-4 h-4 text-blue-500" /> Preguntas
                        </div>
                        <span className="font-bold">{product._count.questions}</span>
                    </div>
                     <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <ShoppingCart className="w-4 h-4 text-green-500" /> Ventas
                        </div>
                        <span className="font-bold">{product._count.orderItems}</span>
                    </div>
                </div>

                 {/* Seller Card */}
                 <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-900 p-4 flex items-center justify-between">
                         <h2 className="text-white font-bold text-sm flex items-center gap-2">
                             <UserIcon className="w-4 h-4" /> Vendedor
                         </h2>
                         {product.userId ? (
                             <Link href={`/admin/users/${product.userId}`} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors uppercase font-bold">
                                 God Mode
                             </Link>
                         ) : null}
                    </div>
                    <div className="p-4">
                         {product.user ? (
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                    {product.user.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{product.user.name || 'Sin Nombre'}</div>
                                    <div className="text-xs text-gray-500">{product.user.email}</div>
                                </div>
                             </div>
                         ) : (
                             <div className="text-sm text-gray-500 italic">Usuario eliminado o desconocido</div>
                         )}
                    </div>
                 </section>

                 {/* Danger Zone */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                     <h3 className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> Zona Peligrosa
                     </h3>
                     <p className="text-[10px] text-red-600 mb-3">Eliminar el producto es irreversible y también eliminará historial asociado.</p>
                     
                     <form action={async () => {
                         "use server";
                         await deleteProduct(product.id);
                         redirect("/admin/products"); 
                     }}>
                         <button className="w-full bg-white border border-red-200 text-red-600 text-xs font-bold py-2 rounded-lg hover:bg-red-50 transition-colors">
                             Eliminar Producto Permanentemente
                         </button>
                     </form>
                </div>
            </div>
        </div>

        {/* BOTTOM: RECENT ORDERS */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Últimas Ventas
                </h2>
                <Link href="/admin/orders" className="text-xs text-purple-600 font-bold hover:underline">
                    Ver Todos los Pedidos
                </Link>
            </div>
            
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Pedido</th>
                            <th className="px-6 py-3">Comprador</th>
                            <th className="px-6 py-3">Precio Unit.</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recentOrderItems.length > 0 ? (
                            recentOrderItems.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(item.order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-500">
                                        #{item.order.id.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.order.user?.name || item.order.customerName}
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {formatCurrencyFromCents(item.priceCents)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            ['DELIVERED', 'COMPLETED'].includes(item.order.status) ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {item.order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${item.order.id}`} className="text-blue-600 hover:underline text-xs font-bold">
                                            VER PEDIDO
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    Este producto aún no se ha vendido.
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </section>

    </div>
  );
}
