import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/UserMenu";
import { ProductsCategorySelect } from "@/components/ProductsCategorySelect";

const navLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Tienda online
        </Link>

        <form action="/products" method="get" className="hidden w-full max-w-sm md:block">
          <label className="sr-only" htmlFor="navbar-search">
            Buscar
          </label>
          <input
            id="navbar-search"
            name="q"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Buscar productos..."
          />
        </form>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <ProductsCategorySelect />
                <Link href="/products" className={navLinkClass}>
                  Productos
                </Link>
              </div>
              <Link href="/cart" className={navLinkClass}>
                Carrito
              </Link>
            </>
          ) : null}

          {!user ? (
            <>
              <Link href="/login" className={navLinkClass}>
                Entrar
              </Link>
              <Link href="/register" className={navLinkClass}>
                Crear usuario
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin/products" className={navLinkClass}>
                Mis publicaciones
              </Link>
              <UserMenu
                user={{
                  name: user.name,
                  email: user.email,
                  avatarUrl: user.avatarUrl,
                  role: user.role,
                }}
              />
            </>
          )}
        </nav>
      </div>

      <div className="border-t md:hidden">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <form action="/products" method="get" className="mx-auto max-w-sm">
            <label className="sr-only" htmlFor="navbar-search-mobile">
              Buscar
            </label>
            <input
              id="navbar-search-mobile"
              name="q"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Buscar productos..."
            />
          </form>
        </div>
      </div>
    </header>
  );
}
