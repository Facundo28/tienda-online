import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { requireUser } from "@/lib/auth/session";
import { ProductCategory } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type ProductRow = Awaited<ReturnType<(typeof prisma.product.findMany)>>[number];

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return letters.join("") || "U";
}

type ProductsPageProps = {
  searchParams?: Promise<{ category?: string }>;
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

  const products = (await prisma.product.findMany({
    where: {
      isActive: true,
      ...(selectedCategory ? { category: selectedCategory } : {}),
    },
    orderBy: { createdAt: "desc" },
  })) as ProductRow[];

  const categories = [
    { value: "ALL", label: "Todas", href: "/products" },
    {
      value: ProductCategory.INDUMENTARIA,
      label: "Indumentaria",
      href: "/products?category=INDUMENTARIA",
    },
    {
      value: ProductCategory.VEHICULOS,
      label: "Vehículos",
      href: "/products?category=VEHICULOS",
    },
    {
      value: ProductCategory.INMUEBLES,
      label: "Inmuebles",
      href: "/products?category=INMUEBLES",
    },
    {
      value: ProductCategory.TECNOLOGIA,
      label: "Tecnología",
      href: "/products?category=TECNOLOGIA",
    },
    {
      value: ProductCategory.HOGAR,
      label: "Hogar",
      href: "/products?category=HOGAR",
    },
    {
      value: ProductCategory.SERVICIOS,
      label: "Servicios",
      href: "/products?category=SERVICIOS",
    },
    {
      value: ProductCategory.OTROS,
      label: "Otros",
      href: "/products?category=OTROS",
    },
  ] as const;

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

      <div className="mt-4 rounded-2xl border bg-background p-4">
        <div className="text-sm font-medium">Categorías</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => {
            const isActive =
              c.value === "ALL"
                ? !selectedCategory
                : selectedCategory === c.value;

            return (
              <Link
                key={c.value}
                href={c.href}
                className={
                  "rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5 " +
                  (isActive ? "bg-foreground/5" : "")
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>
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

                <div className="mt-1 flex items-start justify-between gap-3">
                  <div className="text-sm text-foreground/70 line-clamp-2 min-w-0">
                    {p.description}
                  </div>

                  {user ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="relative h-5 w-5 overflow-hidden rounded-full border bg-foreground/5">
                        {user.avatarUrl ? (
                          <Image
                            src={normalizeImageSrc(user.avatarUrl)}
                            alt={user.name}
                            fill
                            className="object-cover"
                            sizes="20px"
                            unoptimized={normalizeImageSrc(user.avatarUrl).startsWith(
                              "/uploads/",
                            )}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-foreground/70">
                            {initials(user.name)}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-foreground/60 truncate max-w-[10rem]">
                        {user.name}
                      </span>
                    </div>
                  ) : null}
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
