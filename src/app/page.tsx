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

export default async function Home() {
  const user = await getCurrentUser();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      priceCents: true,
      imageUrl: true,
    },
  });

  return (
    <section>
      <div className="rounded-2xl border bg-background p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Tienda online</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Catálogo, carrito y checkout (MVP).
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Empezar a comprar
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}

          {!user ? (
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              Crear usuario
            </Link>
          ) : null}

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
          >
            Administrar productos
          </Link>
        </div>
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
              const imageSrc = p.imageUrl ? normalizeImageSrc(p.imageUrl) : null;
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
