import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { Plus, Trash2, Eye, EyeOff, ImageIcon, Megaphone } from "lucide-react";
import Link from "next/link";
import {
  deleteAdBanner,
  toggleAdBanner,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  await requireAdmin();

  const banners = await prisma.adBanner.findMany({
    orderBy: { createdAt: "desc" },
  });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gestor de Publicidad
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra banners y anuncios de texto (marquesina).
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: BANNERS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              Banners Principales
            </h2>
            <Link
              href="/admin/ads/new"
              className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Banner
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner: any) => (
              <div
                key={banner.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group"
              >
                {/* Preview */}
                <div className="aspect-[3/1] bg-gray-100 relative overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      banner.isActive
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {banner.isActive ? "Activo" : "Pausado"}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">
                    {banner.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {banner.position}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                    <form
                      action={async () => {
                        "use server";
                        await toggleAdBanner(banner.id, !banner.isActive);
                      }}
                      className="flex-1"
                    >
                      <button
                        className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg transition-colors ${
                          banner.isActive
                            ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {banner.isActive ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Pausar
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Activar
                          </>
                        )}
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await deleteAdBanner(banner.id);
                      }}
                    >
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
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
        </section>

        {/* SECTION 2: MARQUEE */}
        <section className="pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gray-400" />
              Marquesina (Texto en Movimiento)
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <form
              action={createAnnouncement}
              className="flex gap-4 items-end"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Anuncio
                </label>
                <input
                  name="text"
                  required
                  placeholder="Ej: ¡Envíos gratis a todo el país!"
                  className="w-full rounded-lg border-gray-300 border px-4 py-2 text-sm"
                />
              </div>
              <button className="bg-[#12753e] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#0e5c30] transition-colors shadow-lg shadow-green-900/10">
                Agregar
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {announcements.map((ann: any) => (
              <div
                key={ann.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <p className="font-medium text-gray-900">{ann.text}</p>
                <div className="flex items-center gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await toggleAnnouncement(ann.id, !ann.isActive);
                    }}
                  >
                    <button
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        ann.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {ann.isActive ? "Visible" : "Oculto"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteAnnouncement(ann.id);
                    }}
                  >
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">
                No hay anuncios en la marquesina.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
