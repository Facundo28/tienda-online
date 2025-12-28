import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatCurrencyFromCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await requireUser();
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Favoritos</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
             <p className="text-gray-500">Aún no tienes favoritos.</p>
             <Link href="/products" className="text-[#12753e] font-medium mt-2 inline-block">Explorar productos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {favorites.map(({ product }) => (
                <Link key={product.id} href={`/products/${product.id}`} className="block border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-gray-100">
                        {product.imageUrl ? (
                             <Image src={product.imageUrl.split('\n')[0]} alt={product.name} fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sin imagen</div>
                        )}
                    </div>
                    <div className="p-4">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-lg font-bold mt-1">{formatCurrencyFromCents(product.priceCents)}</p>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}
