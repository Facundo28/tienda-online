import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

type ProductRow = Awaited<ReturnType<(typeof prisma.product.findMany)>>[number];

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

export default async function ProductsPage() {
  const products = (await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })) as ProductRow[];

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
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: ProductRow) => {
            const imageSrc = p.imageUrl ? normalizeImageSrc(p.imageUrl) : null;

            return (
              <li
                key={p.id}
                className="overflow-hidden rounded-2xl border bg-background"
              >
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
                <div className="mt-1 text-sm text-foreground/70 line-clamp-2">
                  {p.description}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">
                    {formatCurrencyFromCents(p.priceCents)}
                  </div>
                  <AddToCartButton
                    product={{ id: p.id, name: p.name, priceCents: p.priceCents }}
                  />
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
