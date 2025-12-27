import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { answerProductQuestion, createProductQuestion } from "./actions";

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

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const currentUser = await requireUser();

  const { id } = await params;

  const product = (await prisma.product.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
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
  } as any)) as any;

  if (!product || !product.isActive) notFound();

  const imageSrc = product.imageUrl ? normalizeImageSrc(product.imageUrl) : null;
  const owner = product.user as
    | { id: string; name: string; avatarUrl: string | null }
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
          <div className="relative aspect-[4/3] w-full bg-foreground/5">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                unoptimized={imageSrc.startsWith("/uploads/")}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground/60">
                Sin imagen
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="text-sm text-foreground/70">Categoría: {product.category}</div>
          </div>
        </div>

        <aside className="rounded-2xl border bg-background p-5">
          {owner ? (
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

              <Link href={`/users/${owner.id}`} className="text-sm hover:underline">
                {owner.name}
              </Link>
            </div>
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
    </section>
  );
}
