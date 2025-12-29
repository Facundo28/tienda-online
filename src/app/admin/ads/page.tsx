import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { Plus, Trash2, Eye, EyeOff, ExternalLink, ImageIcon } from "lucide-react";
import { deleteAdBanner, toggleAdBanner } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  await requireAdmin();

  const banners = await prisma.adBanner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestor de Publicidad</h1>
          <p className="text-sm text-gray-500 mt-1">
             Administra los banners que aparecen en la home y otras secciones.
          </p>
        </div>
        <Link
          href="/admin/ads/new"
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Banner
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
             {/* Preview */}
             <div className="aspect-[3/1] bg-gray-100 relative overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {banner.isActive ? 'Activo' : 'Pausado'}
                </div>
             </div>
             
             <div className="p-4">
                 <h3 className="font-bold text-gray-900 mb-1 truncate">{banner.title}</h3>
                 <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                     <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{banner.position}</span>
                     {banner.redirectUrl && (
                         <a href={banner.redirectUrl} target="_blank" className="flex items-center gap-1 hover:text-blue-600">
                             Link <ExternalLink className="w-3 h-3" />
                         </a>
                     )}
                 </div>

                 <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                     <form action={async () => {
                         "use server";
                         await toggleAdBanner(banner.id, !banner.isActive);
                     }} className="flex-1">
                         <button className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg transition-colors ${banner.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                             {banner.isActive ? <><EyeOff className="w-3 h-3" /> Pausar</> : <><Eye className="w-3 h-3" /> Activar</>}
                         </button>
                     </form>
                     
                     <form action={async () => {
                         "use server";
                         await deleteAdBanner(banner.id);
                     }}>
                         <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                             <Trash2 className="w-4 h-4" />
                         </button>
                     </form>
                 </div>
             </div>
          </div>
        ))}

        {banners.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay banners creados aún.</p>
            </div>
        )}
      </div>
    </div>
  );
}
