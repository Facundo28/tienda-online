import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import { PickupQrCode } from "@/components/PickupQrCode";
import { DownloadInvoiceButton } from "@/components/DownloadInvoiceButton";
import { ClaimButton } from "@/components/ClaimButton";
import { DeliveryMethod } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      claim: { select: { id: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  function getFirstImage(raw: string | null) {
    if (!raw) return null;
    return raw.split(/[\n,]+/)[0]?.trim();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis Compras</h1>
          <p className="text-sm text-foreground/70">
            Revisa el estado de tus pedidos recientes.
          </p>
        </div>
        <Link
          href="/products"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Ir a la tienda
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center">
          <p className="text-foreground/70">No has realizado ninguna compra aún.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border bg-background"
            >
              <div className="border-b bg-foreground/5 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="font-medium">Pedido</span>
                    <div className="font-mono text-foreground/70">
                      {order.id.slice(-8).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Fecha</span>
                    <div className="text-foreground/70">
                      {order.createdAt.toLocaleDateString("es-AR")}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Total</span>
                    <div className="text-foreground/70">
                      {formatCurrencyFromCents(order.totalCents)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Estado</span>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors border-transparent bg-primary text-primary-foreground">
                        {order.status}
                      </span>
                      <DownloadInvoiceButton order={order} />
                      <ClaimButton 
                        orderId={order.id} 
                        hasClaim={!!order.claim} 
                        orderStatus={order.status}
                      />
                    </div>
                  </div>
                </div>
                {order.deliveryMethod === DeliveryMethod.PICKUP &&
                  order.pickupCode && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <span className="block text-xs font-medium text-foreground/50">
                          Código de retiro
                        </span>
                        <span className="font-mono font-bold">
                          {order.pickupCode}
                        </span>
                      </div>
                      <PickupQrCode
                        orderId={order.id}
                        pickupCode={order.pickupCode}
                        buyerName={order.customerName}
                        sellerName={order.items[0]?.product.user?.name || "Tienda"}
                      />
                    </div>
                  )}
              </div>

              <div className="p-6">
                <ul className="divide-y">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex py-4 first:pt-0 last:pb-0">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            getFirstImage(item.product.imageUrl) ??
                            "https://placehold.co/100?text=IMG"
                          }
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">
                              {formatCurrencyFromCents(item.priceCents)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-foreground/70">
                            Cant: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
