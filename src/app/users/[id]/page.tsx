import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

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

type PublicUserProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicUserProfilePage({
  params,
}: PublicUserProfilePageProps) {
  await requireUser();

  const { id } = await params;

  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          priceCents: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!profile) notFound();

  const avatarSrc = profile.avatarUrl
    ? normalizeImageSrc(profile.avatarUrl)
    : null;

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border bg-foreground/5">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized={avatarSrc.startsWith("/uploads/")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground/70">
                {initials(profile.name)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-foreground/70">
              Productos publicados: {profile.products.length}
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Volver a productos
        </Link>
      </div>

      {profile.products.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-background p-6 text-sm text-foreground/70">
          Este usuario todavía no publicó productos.
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.products.map((p) => {
            const imageSrc = p.imageUrl ? normalizeImageSrc(p.imageUrl) : null;

            return (
              <li key={p.id} className="overflow-hidden rounded-2xl border bg-background">
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

                  <div className="mt-1 text-sm text-foreground/70 line-clamp-2 min-w-0">
                    {p.description}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">
                      {formatCurrencyFromCents(p.priceCents)}
                    </div>
                    <AddToCartButton
                      product={{
                        id: p.id,
                        name: p.name,
                        priceCents: p.priceCents,
                      }}
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
