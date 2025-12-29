import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { AdCarousel } from "@/components/AdCarousel";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { BadgeCheck } from "lucide-react";

export const dynamic = "force-dynamic";

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

import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();



  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
        user: {
            select: {
                name: true,
                avatarUrl: true,
                isVerified: true
            }
        }
    }
  });

  // Fetch Banners
  const banners = await prisma.adBanner.findMany({
    where: { isActive: true, position: "HOME_MAIN" },
    orderBy: { createdAt: "desc" }
  });

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Hero Banner / Carousel */}
      <section>
         {banners.length > 0 ? (
             <AdCarousel banners={banners} />
         ) : (
            <div className="relative w-full aspect-[3/1] md:aspect-[4/1] bg-gradient-to-r from-[#12753e] to-[#0e5c30] rounded-2xl overflow-hidden flex items-center px-12 text-white shadow-lg">
                <div className="relative z-10 max-w-lg">
                <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Bienvenido a Market Online</h2>
                <p className="text-lg text-emerald-100 mb-6 font-medium">La plataforma más segura para comprar y vender cerca de ti.</p>
                {!user && (
                    <Link href="/auth/login" className="bg-white text-[#12753e] px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform">
                    Comenzar Ahora
                    </Link>
                )}
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>
         )}
      </section>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Productos</h2>
        <p className="mt-1 text-sm text-foreground/70">
          {user
            ? "Abrí un producto para ver el detalle."
            : "Iniciá sesión para ver el detalle de un producto."}
        </p>

        {products.length === 0 ? (
          <div className="mt-4 rounded-2xl border bg-background p-6 text-sm text-foreground/70">
            Aún no hay productos.
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 bg-gray-50/50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
            {products.map((p: any) => {
              const imageSrc = firstImageUrl(p.imageUrl);
              const href = user ? `/products/${p.id}` : "/login";
              const installmentsValue = p.priceCents / 6;

              return (
                <li
                  key={p.id}
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-gray-100"
                >
                  <Link
                    href={href}
                    className="absolute inset-0 z-10"
                    aria-label={user ? `Ver ${p.name}` : "Iniciar sesión"}
                  />

                  {/* Image Section */}
                  <div className="relative aspect-square w-full bg-white border-b border-gray-50 flex items-center justify-center p-8">
                    {p.boostedUntil && p.boostedUntil > now && (
                      <div className="absolute right-0 top-3 z-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm rounded-l-md uppercase tracking-wide">
                        Destacado
                      </div>
                    )}
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={p.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                        unoptimized={imageSrc.startsWith("/uploads/")}
                      />
                    ) : (
                      <div className="text-xs text-gray-300 font-medium">Sin imagen</div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="font-normal text-2xl text-[#12753e]">
                          {formatCurrencyFromCents(p.priceCents)}
                        </div>
                        
                         {!p.priceCents || p.priceCents <= 500000 ? (
                            <p className="text-xs text-green-600 font-bold mt-1">
                                5% OFF
                            </p>
                         ): null}
                        
                        <h3 className="mt-3 text-sm font-bold text-gray-900 line-clamp-2 leading-relaxed group-hover:text-[#12753e] transition-colors">
                            {p.name}
                        </h3>
                    </div>

                    {/* Seller Info */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                        <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            {p.user?.avatarUrl ? (
                                <Image src={p.user.avatarUrl} alt={p.user.name || "Vendedor"} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-400">
                                    {p.user?.name?.charAt(0).toUpperCase() || "V"}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 truncate flex-1 leading-none">
                            {p.user?.name || "Vendedor"}
                        </span>
                        {p.user?.isVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
