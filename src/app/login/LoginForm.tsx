"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (state?.error) setIsModalOpen(true);
  }, [state?.error]);

  return (
    <>
      <form action={formAction} className="mt-6 grid gap-3">
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
          className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {isModalOpen && state?.error ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Error de inicio de sesión"
        >
          <div className="w-full max-w-sm rounded-2xl border bg-background p-6">
            <div className="text-base font-semibold">Error</div>
            <div className="mt-2 text-sm text-foreground/70">{state.error}</div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
                onClick={() => setIsModalOpen(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
