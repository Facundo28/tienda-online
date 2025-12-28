import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrencyFromCents } from "@/lib/money";

export default async function SellerDashboard() {
  const user = await requireUser();
  
  // Fetch user's products
  const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-[1248px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Ventas</h1>
                <p className="text-gray-500 text-sm">Gestiona tus publicaciones y ventas.</p>
            </div>
            <Link 
                href="/products/new" 
                className="bg-[#12753e] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0f5f32] transition-colors shadow-sm flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Publicar
            </Link>
        </div>

        {/* Stats Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Ventas del mes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Publicaciones Activas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{products.filter(p => p.isActive).length}</p>
            </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Reclamos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">Mis Publicaciones</h2>
            </div>
            
            {products.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <p>Aún no tienes publicaciones.</p>
                    <Link href="/products/new" className="text-[#12753e] font-medium hover:underline mt-2 inline-block">¡Publica tu primer producto!</Link>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {products.map(product => (
                        <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl.split(',')[0]} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400">Sin foto</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                                <p className="text-sm text-gray-500">{formatCurrencyFromCents(product.priceCents)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {product.isActive ? 'Activa' : 'Pausada'}
                                </span>
                                <Link href={`/products/${product.id}/edit`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
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
