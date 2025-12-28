"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart/useCart";
import { formatCurrencyFromCents } from "@/lib/money";

export function CartClient() {
  const { cart, removeItem, setQuantity, totals } = useCart();

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Carrito</h1>
          <p className="text-sm text-foreground/70">
            Revisa cantidades y continua al checkout.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-foreground/5"
          href="/products"
        >
          Seguir comprando
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-background p-6 text-sm text-foreground/70">
          Tu carrito está vacío.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <li
                key={item.productId}
                className="rounded-2xl border bg-background p-5 flex items-center justify-between gap-6"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div className="text-sm text-foreground/70">
                    {formatCurrencyFromCents(item.priceCents)} c/u
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    className="text-sm text-foreground/70"
                    htmlFor={`qty-${item.productId}`}
                  >
                    Cant.
                  </label>
                  <input
                    id={`qty-${item.productId}`}
                    className="w-20 rounded-md border bg-background px-2 py-1 text-sm"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.productId, Number(e.target.value || 1))
                    }
                  />
                  <button
                    type="button"
                    className="text-sm font-medium underline underline-offset-4"
                    onClick={() => removeItem(item.productId)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border bg-background p-5 flex items-center justify-between">
            <div className="text-sm text-foreground/70">
              {totals.itemsCount} item(s)
            </div>
            <div className="font-semibold">
              Total: {formatCurrencyFromCents(totals.totalCents)}
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Ir a pagar
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
