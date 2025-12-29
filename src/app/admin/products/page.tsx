import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { deleteProduct } from "./actions";
import { requireUser } from "@/lib/auth/session";
import { Trash2, Eye, Package, Image as ImageIcon, Zap } from "lucide-react";
import { CreateProductModal } from "./CreateProductModal"; // Keep if needed or remove if unused, but user said remove ADD button.
// Actually user said remove "Agregar producto". The other modals are used in the list.
import { BoostProductButton } from "./BoostProductButton";

export const dynamic = "force-dynamic";

type ProductRow = Awaited<ReturnType<(typeof prisma.product.findMany)>>[number];

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

function firstImageUrl(raw: string | null) {
  if (!raw) return null;
  const first = raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)[0];
  return first ? normalizeImageSrc(first) : null;
}

function formatCategory(value: string) {
  switch (value) {
    case "INDUMENTARIA":
      return "Indumentaria";
    case "VEHICULOS":
      return "Vehículos";
    case "INMUEBLES":
      return "Inmuebles";
    case "TECNOLOGIA":
      return "Tecnología";
    case "HOGAR":
      return "Hogar";
    case "SERVICIOS":
      return "Servicios";
    default:
      return "Otros";
  }
}

export default async function AdminProductsPage() {
  const user = await requireUser();
  const products = await prisma.product.findMany({
    orderBy: [{ boostedUntil: "desc" }, { createdAt: "desc" }],
    include: { user: true },
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Administrador de Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión global del catálogo, precios y estados de publicación.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm text-gray-700"
            href="/products"
          >
            <Eye className="w-4 h-4 mr-2 text-gray-500" />
            Ver Catálogo Público
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {products.length === 0 ? (
           <div className="p-12 text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                   <Package className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No hay productos</h3>
               <p className="text-gray-500 mt-1">El catálogo está vacío actualmente.</p>
           </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">Precio</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Vendedor</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((p: ProductRow) => {
                             const isBoosted = !!(p.boostedUntil && new Date(p.boostedUntil) > new Date());
                             return (
                                <tr key={p.id} className={`group hover:bg-slate-50 transition-colors ${isBoosted ? 'bg-emerald-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                                                {firstImageUrl(p.imageUrl) ? (
                                                    <Image
                                                        src={firstImageUrl(p.imageUrl) ?? ""}
                                                        alt={p.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                        unoptimized={(firstImageUrl(p.imageUrl) ?? "").startsWith("/uploads/")}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <ImageIcon className="w-4 h-4 text-gray-300" />
                                                    </div>
                                                )}
                                                {isBoosted && (
                                                    <div className="absolute top-0 right-0 p-0.5 bg-emerald-500 rounded-bl-md">
                                                        <Zap className="w-2.5 h-2.5 text-white fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="max-w-[240px]">
                                                <div className="font-semibold text-gray-900 truncate" title={p.name}>{p.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-gray-700">
                                        {formatCurrencyFromCents(p.priceCents)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                            {formatCategory(String(p.category))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/users/${p.userId}`} className="group/user flex items-center gap-2 max-w-[150px]">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                {(p as any).user?.name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex flex-col truncate">
                                                <span className="text-xs font-medium text-gray-700 truncate group-hover/user:text-blue-600 transition-colors">
                                                    {(p as any).user?.name || "Desconocido"}
                                                </span>
                                                <span className="text-[10px] text-gray-400 truncate">
                                                    {(p as any).user?.email}
                                                </span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link 
                                                href={`/admin/products/${p.id}`} 
                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                            >
                                                Modificar
                                            </Link>
                                            
                                            <form
                                                action={async () => {
                                                  "use server";
                                                  await deleteProduct(p.id);
                                                }}
                                            >
                                                <button
                                                  type="submit"
                                                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                  title="Eliminar"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
