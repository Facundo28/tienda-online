import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/LogoutButton";

const navLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Tienda online
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/products" className={navLinkClass}>
            Productos
          </Link>
          <Link href="/cart" className={navLinkClass}>
            Carrito
          </Link>

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
                Administrar productos
              </Link>
              {user.role === "ADMIN" ? (
                <Link href="/admin/users" className={navLinkClass}>
                  Usuarios
                </Link>
              ) : null}
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
