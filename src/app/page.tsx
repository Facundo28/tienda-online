import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";

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

export default async function Home() {
  const user = await getCurrentUser();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ boostedUntil: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: {
      id: true,
      name: true,
      priceCents: true,
      imageUrl: true,
      boostedUntil: true,
    },
  });

  const now = new Date();

  return (
    <section>
      <div className="mb-6 w-full">
          <Image 
            src="/portada1.png" 
            alt="Market Online Banner" 
            width={1248} 
            height={300} 
            className="w-full h-auto rounded-xl shadow-md object-cover"
            priority
          />
      </div>

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
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const imageSrc = firstImageUrl(p.imageUrl);
              const href = user ? `/products/${p.id}` : "/login";

              return (
                <li
                  key={p.id}
                  className="relative overflow-hidden rounded-2xl border bg-background"
                >
                  <Link
                    href={href}
                    className="absolute inset-0"
                    aria-label={user ? `Ver ${p.name}` : "Iniciar sesión"}
                  />

                  <div className="relative aspect-[4/3] w-full bg-foreground/5">
                    {p.boostedUntil && p.boostedUntil > now && (
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black shadow-sm">
                        DESTACADO
                      </div>
                    )}
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        unoptimized={imageSrc.startsWith("/uploads/")}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground/60">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="mt-3 text-sm font-semibold">
                      {formatCurrencyFromCents(p.priceCents)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
