import Link from "next/link";

import { LoginForm } from "./LoginForm";

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

        <LoginForm />

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
