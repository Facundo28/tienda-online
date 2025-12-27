import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { createProduct, deleteProduct, toggleProduct } from "./actions";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ProductRow = Awaited<ReturnType<(typeof prisma.product.findMany)>>[number];

export default async function AdminProductsPage() {
  await requireUser();
  const products = (await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })) as ProductRow[];

  const categories = [
    { value: "INDUMENTARIA", label: "Indumentaria" },
    { value: "VEHICULOS", label: "Vehículos" },
    { value: "INMUEBLES", label: "Inmuebles" },
    { value: "TECNOLOGIA", label: "Tecnología" },
    { value: "HOGAR", label: "Hogar" },
    { value: "SERVICIOS", label: "Servicios" },
    { value: "OTROS", label: "Otros" },
  ] as const;

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin: Productos</h1>
          <p className="text-sm text-foreground/70">
            Crea y administra el catálogo.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
          href="/products"
        >
          Ver catálogo
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <section className="rounded-2xl border bg-background p-6">
          <h2 className="font-semibold">Crear producto</h2>
          <form
            className="mt-3 grid grid-cols-1 gap-3"
            action={createProduct}
            encType="multipart/form-data"
          >
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              name="name"
              placeholder="Nombre"
              required
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              name="description"
              placeholder="Descripción"
              required
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              name="priceCents"
              placeholder="Precio (en centavos, ej: 1999 = 19.99)"
              type="number"
              min={1}
              required
            />

            <div className="grid gap-1">
              <label
                className="text-sm font-medium text-foreground/80"
                htmlFor="category"
              >
                Categoría
              </label>
              <select
                id="category"
                name="category"
                defaultValue="OTROS"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium text-foreground/80" htmlFor="image">
                Foto (opcional)
              </label>
              <input
                id="image"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
              />
              <div className="text-xs text-foreground/60">
                JPG/PNG/WebP · máx 5MB
              </div>
            </div>
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              name="imageUrl"
              placeholder="Imagen URL (opcional, si no subes foto)"
            />
            <button
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              type="submit"
            >
              Crear
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-background p-6">
          <h2 className="font-semibold">Listado</h2>
          {products.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/70">No hay productos aún.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {products.map((p: ProductRow) => (
                <li
                  key={p.id}
                  className="rounded-2xl border p-5 flex items-center justify-between gap-6"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-sm text-foreground/70 truncate">
                      {p.description}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {formatCurrencyFromCents(p.priceCents)}
                      </span>{" "}
                      <span className="text-foreground/70">
                        · {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <form
                      action={async () => {
                        "use server";
                        await toggleProduct(p.id, !p.isActive);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                      >
                        {p.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </form>

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
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
