import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { requireUser } from "@/lib/auth/session";
import { ProductCategory } from "@/generated/prisma/enums";
import { BadgeCheck } from "lucide-react";
import { ProductFilters } from "@/components/products/ProductFilters";

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

type ProductsPageProps = {
  searchParams?: Promise<{ 
    category?: string; 
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    location?: string;
  }>;
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
  const minPrice = resolvedSearchParams?.minPrice ? parseInt(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams?.maxPrice ? parseInt(resolvedSearchParams.maxPrice) : undefined;
  const selectedCondition = resolvedSearchParams?.condition;
  const selectedLocation = resolvedSearchParams?.location;

  // Build Where Clause
  const where: any = {
      isActive: true,
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedCondition ? { condition: selectedCondition } : {}),
      ...(query ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined ? {
          priceCents: {
              ...(minPrice !== undefined ? { gte: minPrice * 100 } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice * 100 } : {}),
          }
      } : {}),
      ...(selectedLocation ? {
          user: {
              OR: [
                  { city: { contains: selectedLocation } },
                  { state: { contains: selectedLocation } }
              ]
          }
      } : {})
  };

  // Parallel Fetch: Products + Aggregations
  const [products, categoryGroups, conditionGroups] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
              city: true,
              state: true,
            },
          },
        },
      }),
      // Aggregations (Independent of filters to show all options? Or dependent? 
      // Usually dependent on Query but independent of specific facets. 
      // For simplicity, we fetch Global Active counts for now)
      prisma.product.groupBy({
          by: ['category'],
          where: { isActive: true },
          _count: true
      }),
      prisma.product.groupBy({
          by: ['condition'],
          where: { isActive: true },
          _count: true
      })
  ]);

  // Process Aggregations
  const categories = categoryGroups.map((g: { category: ProductCategory; _count: number }) => ({
      name: g.category,
      value: g.category,
      count: g._count
  }));

  const conditions = conditionGroups.map((g: { condition: string; _count: number }) => ({
      name: g.condition === 'NEW' ? 'Nuevo' : 'Usado',
      value: g.condition,
      count: g._count
  }));

  // Aggregating locations from the CURRENT filtered results to ensure relevance
  const locationCounts = products.reduce((acc: Record<string, number>, p: any) => {
      const loc = p.user?.city || p.user?.state;
      if (loc) {
          acc[loc] = (acc[loc] || 0) + 1;
      }
      return acc;
  }, {} as Record<string, number>);

  const locations = Object.entries(locationCounts).map(([name, count]) => ({
      name,
      value: name,
      count: count as number
  })).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8">
      
      <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
             <div className="sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{query ? `Resultados para "${query}"` : "Productos"}</h2>
                <div className="mb-4 text-sm text-gray-500">
                    {products.length} resultados
                </div>

                <ProductFilters 
                    categories={categories}
                    conditions={conditions}
                    locations={locations}
                />
             </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
             
              {products.length === 0 ? (
                <div className="rounded-2xl border bg-background p-10 text-center text-foreground/70">
                  <h3 className="text-lg font-medium text-gray-900">No hay publicaciones que coincidan con tu búsqueda.</h3>
                  <p className="mt-2 text-sm">Revisá la ortografía de la palabra.</p>
                  <ul className="mt-2 text-sm list-inside">
                      <li>Utilizá palabras más genéricas o menos palabras.</li>
                      <li>Navegá por las categorías para encontrar un producto similar.</li>
                  </ul>
                  <div className="mt-6">
                      <Link className="text-[#12753e] font-medium hover:underline" href="/products">
                        Ver todos los productos
                      </Link>
                  </div>
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {products.map((p: any) => {
                    const imageSrc = firstImageUrl(p.imageUrl);
                    const owner = p.user;

                    return (
                      <li
                        key={p.id}
                        className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-200"
                      >
                        <Link
                          href={`/products/${p.id}`}
                          className="absolute inset-0 z-10"
                          aria-label={`Ver ${p.name}`}
                        />
                        
                        {/* Image Section */}
                        <div className="relative aspect-square w-full bg-white border-b border-gray-100 flex items-center justify-center p-4">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={p.name}
                              fill
                              className="object-contain transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="text-xs text-gray-300 font-medium">Sin imagen</div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="font-normal text-2xl text-gray-900 group-hover:text-[#12753e] transition-colors">
                                  {formatCurrencyFromCents(p.priceCents)}
                                </div>
                                
                                 {!p.priceCents || p.priceCents <= 500000 ? (
                                    <span className="text-xs font-semibold text-[#00a650] bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                        5% OFF
                                    </span>
                                 ): null}
                                
                                <h3 className="mt-2 text-sm font-normal text-gray-600 line-clamp-2 leading-snug">
                                    {p.name}
                                </h3>
                            </div>

                            {/* Seller Info */}
                            {owner?.isVerified && (
                                <div className="mt-2 text-xs text-gray-400">
                                   Por <span className="font-medium text-gray-600">{owner.name}</span>
                                </div>
                            )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
          </div>
      </div>
    </section>
  );
}
