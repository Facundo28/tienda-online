import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { requireUser } from "@/lib/auth/session";
import { ProductCategory } from "@/generated/prisma/enums";
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

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return letters.join("") || "U";
}

type ProductsPageProps = {
  searchParams?: Promise<{ category?: string; q?: string }>;
};

function parseCategory(value: string | undefined): ProductCategory | null {
  if (!value) return null;
  if (Object.values(ProductCategory).includes(value as ProductCategory)) {
    return value as ProductCategory;
  }
  return null;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const user = await requireUser();

  const resolvedSearchParams = await searchParams;
  const selectedCategory = parseCategory(resolvedSearchParams?.category);
  const query = String(resolvedSearchParams?.q ?? "").trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
        },
      },
    },
  });

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-foreground/70">
            Agrega productos al carrito y finaliza tu pedido.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
          href="/cart"
        >
          Ver carrito
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-background p-6 text-sm text-foreground/70">
          Aún no hay productos. Agrega productos en{" "}
          <Link className="underline" href="/admin/products">
            Admin
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 bg-gray-50/50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
          {products.map((p) => {
            const imageSrc = firstImageUrl(p.imageUrl);
            const owner = p.user;

            return (
              <li
                key={p.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-gray-100"
              >
                <Link
                  href={`/products/${p.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Ver ${p.name}`}
                />
                
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-white border-b border-gray-50 flex items-center justify-center p-8">
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
                            {owner?.avatarUrl ? (
                                <Image src={normalizeImageSrc(owner.avatarUrl)} alt={owner.name || "Vendedor"} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-400">
                                    {owner?.name?.charAt(0).toUpperCase() || "V"}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 truncate flex-1 leading-none">
                            {owner?.name || "Vendedor"}
                        </span>
                        {/* @ts-ignore */}
                        {owner?.isVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                    </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
