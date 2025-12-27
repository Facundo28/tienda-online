import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { deleteProduct } from "./actions";
import { requireUser } from "@/lib/auth/session";
import { CreateProductModal } from "./CreateProductModal";
import { EditProductModal } from "./EditProductModal";

export const dynamic = "force-dynamic";

type ProductRow = Awaited<ReturnType<(typeof prisma.product.findMany)>>[number];

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
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
  const products = (await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })) as ProductRow[];

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis publicaciones</h1>
          <p className="text-sm text-foreground/70">
            Crea y administra tus productos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateProductModal />
          <Link
            className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
            href="/products"
          >
            Ver catálogo
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <section className="rounded-2xl border bg-background p-6">
          <h2 className="font-semibold">Listado</h2>
          {products.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/70">No hay productos aún.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {products.map((p: ProductRow) => (
                <li
                  key={p.id}
                  className="rounded-2xl border p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border bg-foreground/5">
                        {p.imageUrl ? (
                          <Image
                            src={normalizeImageSrc(p.imageUrl)}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized={normalizeImageSrc(p.imageUrl).startsWith(
                              "/uploads/",
                            )}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-foreground/60">
                            Sin foto
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-semibold">{p.name}</div>
                        <div className="mt-1 text-sm text-foreground/70 line-clamp-2">
                          {p.description}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70">
                          <span className="rounded-md border px-2 py-1">
                            {formatCategory(String(p.category))}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCurrencyFromCents(p.priceCents)}
                          </span>
                          <span className="rounded-md border px-2 py-1">
                            {p.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <EditProductModal
                        product={{
                          id: p.id,
                          name: p.name,
                          description: p.description,
                          priceCents: p.priceCents,
                          category: String(p.category),
                          imageUrl: p.imageUrl,
                        }}
                      />

                      <form
                        action={async () => {
                          "use server";
                          await deleteProduct(p.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
