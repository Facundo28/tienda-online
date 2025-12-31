import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductListItem from "./ProductListItem";


export default async function SellerDashboard() {
  const user = await requireUser();
  
  // Fetch user's products
  const products = await prisma.product.findMany({
      where: { 
          userId: user.id,
          isDeleted: false 
      },
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{products.filter((p: any) => p.isActive).length}</p>
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
                    {products.map((product: any) => (
                        <ProductListItem key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
