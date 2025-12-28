import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { DeliveryMethod, DeliveryStatus, UserRole } from "@/generated/prisma/enums";

export async function POST(req: Request) {
  const user = await requireUser();

  if (user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  if (!body || typeof body.code !== "string") {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  const code = body.code.trim().toUpperCase();

  const order = await prisma.order.findFirst({
    where: {
      pickupCode: code,
      deliveryMethod: DeliveryMethod.PICKUP,
    },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Código no encontrado o no corresponde a un retiro" },
      { status: 404 },
    );
  }

  if (order.deliveryStatus === DeliveryStatus.DELIVERED) {
    return NextResponse.json(
      { error: "Este pedido ya fue entregado previamente" },
      { status: 400 },
    );
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      deliveryStatus: DeliveryStatus.DELIVERED,
      status: "FULFILLED",
      fundsReleased: true,
      scanLatitude: body.lat,
      scanLongitude: body.lng,
    },
  });

  // Update Reputation for Sellers
  // For each distinct seller in the order, recalculate score
  const sellerIds = new Set(order.items.map(i => i.product.userId).filter(Boolean));
  // Dynamic import or direct? Direct is fine if safe.
  import("@/lib/reputation").then(({ updateReputation }) => {
      sellerIds.forEach(id => updateReputation(id as string));
  });

  return NextResponse.json({
    success: true,
    order: {
      id: updatedOrder.id,
      customerName: updatedOrder.customerName,
      totalCents: updatedOrder.totalCents,
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
      })),
      fundsReleased: true,
    },
  });
}
