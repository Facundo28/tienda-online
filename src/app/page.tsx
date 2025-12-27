import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <section className="mx-auto max-w-3xl">
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
    </section>
  );
}
