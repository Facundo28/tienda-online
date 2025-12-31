import Link from "next/link";

import { register } from "./actions";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-background p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Crear usuario</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Crea tu cuenta para comprar y hacer pedidos.
        </p>

        <form action={register} className="mt-6 grid gap-3">
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm"
            name="name"
            placeholder="Nombre"
            required
            autoComplete="name"
          />
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
            placeholder="Contraseña (mín. 8 caracteres)"
            required
            autoComplete="new-password"
          />

          <button
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            type="submit"
          >
            Crear cuenta
          </button>
        </form>

        <div className="mt-4 text-sm text-foreground/70">
          ¿Ya tienes cuenta?{" "}
          <Link className="underline" href="/login">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
