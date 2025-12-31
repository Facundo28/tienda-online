"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";

import { login, verifyLogin2FA, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [verifyState, verifyAction, isVerifyPending] = useActionState(verifyLogin2FA, {});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If initial login says "require2FA", we switch to 2FA mode locally
  // We can track this with a state derived from `state`
  const show2FA = state?.require2FA || verifyState?.require2FA;

  useEffect(() => {
    if (state?.error) setIsModalOpen(true);
    if (verifyState?.error) setIsModalOpen(true);
  }, [state?.error, verifyState?.error]);

  if (show2FA) {
      return (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-right-8">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                  {state?.message || verifyState?.message || "Ingresa el código de seguridad."}
              </div>
              
              <form action={verifyAction} className="grid gap-3">
                  <input type="hidden" name="userId" value={state?.userId || verifyState?.userId} />
                  
                  <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">Código de Verificación</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-center text-xl tracking-widest font-mono"
                        type="text"
                        name="code"
                        placeholder="000000"
                        required
                        autoFocus
                        autoComplete="one-time-code"
                      />
                  </div>

                  <button
                    className="inline-flex items-center justify-center rounded-md bg-[#12753e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0e5e32] disabled:opacity-60"
                    type="submit"
                    disabled={isVerifyPending}
                  >
                    {isVerifyPending ? "Verificando..." : "Verificar"}
                  </button>
              </form>
              
              {/* Error Modal for 2FA */}
              {(verifyState?.error) && (
                 <div className="text-center text-xs text-red-600 font-medium">
                     {verifyState.error}
                 </div>
              )}
          </div>
      );
  }

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

      {isModalOpen && state?.error && !show2FA ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border bg-background p-6">
             <div className="text-base font-semibold text-red-600">Error</div>
             <div className="mt-2 text-sm text-foreground/70">{state.error}</div>
             <button
                className="mt-4 w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                onClick={() => setIsModalOpen(false)}
             >
                Intentar de nuevo
             </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
