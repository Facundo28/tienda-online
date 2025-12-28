import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { answerProductQuestion, createProductQuestion } from "./actions";

export const dynamic = "force-dynamic";

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

function parseImageUrls(raw: string | null | undefined) {
  if (!raw) return [];
  return raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeImageSrc);
}

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return letters.join("") || "U";
}

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const currentUser = await requireUser();

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          reputationTier: true,
          isVerified: true,
        },
      },
      questions: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  }) as any;

  if (!product || !product.isActive) notFound();

  const imageUrls = parseImageUrls(product.imageUrl);
  const owner = product.user as
    | { id: string; name: string; avatarUrl: string | null; reputationTier: string | null; isVerified: boolean }
    | null
    | undefined;
  const isOwner = Boolean(owner?.id && owner.id === currentUser.id);
  const ownerAvatarSrc = owner?.avatarUrl ? normalizeImageSrc(owner.avatarUrl) : null;
  const questions = (product.questions ?? []) as Array<{
    id: string;
    text: string;
    answerText?: string | null;
    answeredAt?: Date | null;
    createdAt: Date;
    user: { id: string; name: string; avatarUrl: string | null };
  }>;

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-foreground/70">{product.description}</p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Volver
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border bg-background">
          <ProductImageGallery imageUrls={imageUrls} alt={product.name} />

          <div className="p-5">
            <div className="text-sm text-foreground/70">Categoría: {product.category}</div>
          </div>
        </div>

        <aside className="rounded-2xl border bg-background p-5">
          {owner ? (
            <>
              <div className="flex items-center gap-2">
                <span className="relative h-7 w-7 overflow-hidden rounded-full border bg-foreground/5">
                  {ownerAvatarSrc ? (
                    <Image
                      src={ownerAvatarSrc}
                      alt={owner.name}
                      fill
                      className="object-cover"
                      sizes="28px"
                      unoptimized={ownerAvatarSrc.startsWith("/uploads/")}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-foreground/70">
                      {initials(owner.name)}
                    </span>
                  )}
                </span>

                <Link href={`/users/${owner.id}`} className="text-sm hover:underline font-medium">
                  {owner.name}
                </Link>
                {owner.isVerified && (
                    <span className="text-blue-500" title="Identidad Verificada">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                      </svg>
                    </span>
                )}
              </div>
              
              {(owner.reputationTier) && (
                   <div className="mt-2 text-xs flex items-center gap-1.5">
                      <span className="text-foreground/60">Reputación:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold
                          ${owner.reputationTier === 'PLATINUM' ? 'bg-indigo-100 text-indigo-700' : ''}
                          ${owner.reputationTier === 'VERDE' ? 'bg-green-100 text-green-700' : ''}
                          ${owner.reputationTier === 'AMARILLO' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${owner.reputationTier === 'NARANJA' ? 'bg-orange-100 text-orange-700' : ''}
                          ${owner.reputationTier === 'ROJO' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                          {owner.reputationTier}
                      </span>
                   </div>
              )}
            </>
          ) : null}

          <div className="mt-4 text-lg font-semibold">
            {formatCurrencyFromCents(product.priceCents)}
          </div>

          <div className="mt-4">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                priceCents: product.priceCents,
              }}
            />

            <div className="mt-2">
              <BuyNowButton
                product={{
                  id: product.id,
                  name: product.name,
                  priceCents: product.priceCents,
                }}
              />
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 rounded-2xl border bg-background p-6" id="preguntas">
        <h2 className="text-lg font-semibold">Preguntas</h2>
        <p className="mt-1 text-sm text-foreground/70">
          Hacé una pregunta sobre este producto.
        </p>

        <form
          className="mt-4 grid gap-3"
          action={createProductQuestion.bind(null, product.id)}
        >
          <textarea
            name="text"
            className="min-h-[90px] rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Escribí tu pregunta..."
            required
          />
          <div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Preguntar
            </button>
          </div>
        </form>

        {questions.length === 0 ? (
          <div className="mt-6 text-sm text-foreground/70">
            Todavía no hay preguntas.
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {questions.map((q) => {
              const qUser = q.user;
              const qUserAvatarSrc = qUser.avatarUrl
                ? normalizeImageSrc(qUser.avatarUrl)
                : null;
              const createdLabel = new Intl.DateTimeFormat("es-AR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(q.createdAt);

              return (
                <li key={q.id} className="rounded-xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="relative h-7 w-7 overflow-hidden rounded-full border bg-foreground/5">
                        {qUserAvatarSrc ? (
                          <Image
                            src={qUserAvatarSrc}
                            alt={qUser.name}
                            fill
                            className="object-cover"
                            sizes="28px"
                            unoptimized={qUserAvatarSrc.startsWith("/uploads/")}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-foreground/70">
                            {initials(qUser.name)}
                          </span>
                        )}
                      </span>
                      <Link
                        href={`/users/${qUser.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {qUser.name}
                      </Link>
                    </div>

                    <div className="text-xs text-foreground/60">{createdLabel}</div>
                  </div>

                  <div className="mt-3 text-sm text-foreground/80 whitespace-pre-wrap">
                    {q.text}
                  </div>

                  {q.answerText ? (
                    <div className="mt-4 rounded-lg border bg-foreground/5 p-3">
                      <div className="text-xs font-medium text-foreground/70">
                        Respuesta del vendedor
                      </div>
                      <div className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">
                        {q.answerText}
                      </div>
                    </div>
                  ) : isOwner ? (
                    <form
                      className="mt-4 grid gap-2"
                      action={answerProductQuestion.bind(null, q.id)}
                    >
                      <textarea
                        name="answerText"
                        className="min-h-[70px] rounded-md border bg-background px-3 py-2 text-sm"
                        placeholder="Responder pregunta..."
                        required
                      />
                      <div>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
                        >
                          Responder
                        </button>
                      </div>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-8 rounded-2xl border bg-background p-6" id="reviews">
        <ProductReviews productId={product.id} />
      </div>

    </section>
  );
}
