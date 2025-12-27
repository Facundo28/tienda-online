"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/useCart";
import { formatCurrencyFromCents } from "@/lib/money";

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const { cart, totals, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      cart.items.length > 0 &&
      form.customerName.trim() &&
      form.customerEmail.trim() &&
      form.addressLine1.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.postalCode.trim()
    );
  }, [cart.items.length, form]);

  async function submit() {
    setError(null);
    setOrderId(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerPhone: form.customerPhone || undefined,
          addressLine2: form.addressLine2 || undefined,
          items: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { orderId: string }
        | { error: string }
        | null;

      if (!res.ok) {
        setError(
          (data as { error?: string } | null)?.error || "Error en el checkout",
        );
        return;
      }

      setOrderId((data as { orderId: string }).orderId);
      clear();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-foreground/70">
            Completa tus datos para crear el pedido.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
          href="/cart"
        >
          Volver al carrito
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-background p-6 text-sm text-foreground/70">
          Tu carrito está vacío. Ve a{" "}
          <Link className="underline" href="/products">
            Productos
          </Link>
          .
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border bg-background p-6">
            <div className="text-sm text-foreground/70">Total</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {formatCurrencyFromCents(totals.totalCents)}
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6">
            <div className="grid grid-cols-1 gap-3">
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Nombre completo"
                value={form.customerName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customerName: e.target.value }))
                }
              />
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Email"
                type="email"
                value={form.customerEmail}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customerEmail: e.target.value }))
                }
              />
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Teléfono (opcional)"
                value={form.customerPhone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customerPhone: e.target.value }))
                }
              />
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Dirección"
                value={form.addressLine1}
                onChange={(e) =>
                  setForm((p) => ({ ...p, addressLine1: e.target.value }))
                }
              />
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Depto / piso (opcional)"
                value={form.addressLine2}
                onChange={(e) =>
                  setForm((p) => ({ ...p, addressLine2: e.target.value }))
                }
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Ciudad"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                />
                <input
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Estado/Provincia"
                  value={form.state}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, state: e.target.value }))
                  }
                />
                <input
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Código postal"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, postalCode: e.target.value }))
                  }
                />
              </div>

              <button
                type="button"
                disabled={!canSubmit || submitting}
                className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                onClick={submit}
              >
                {submitting ? "Procesando..." : "Confirmar pedido"}
              </button>

              {error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : null}

              {orderId ? (
                <div className="rounded-md border bg-background p-4 text-sm">
                  Pedido creado: <span className="font-mono">{orderId}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
