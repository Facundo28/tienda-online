import Link from "next/link";

import { login } from "./actions";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-background p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Accede para administrar usuarios y productos.
        </p>

        <form action={login} className="mt-6 grid gap-3">
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm"
            type="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="email"
          />
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm"
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            autoComplete="current-password"
          />

          <button
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            type="submit"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 text-sm text-foreground/70">
          ¿No tienes cuenta?{" "}
          <Link className="underline" href="/register">
            Crear usuario
          </Link>
        </div>
      </div>
    </section>
  );
}
