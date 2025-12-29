"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DeliveryStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeDeliveryAction(orderId: string, lat: number, lng: number, proofUrl: string) {
  const user = await requireUser();
  // Check if courier or admin
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) throw new Error("Pedido no encontrado");
  if (order.courierId !== user.id && user.role !== "ADMIN" && user.role !== "LOGISTICS_ADMIN") {
      throw new Error("No tienes permiso");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryStatus: DeliveryStatus.DELIVERED,
      status: "FULFILLED", // Sync with main status
      deliveryLat: lat,
      deliveryLng: lng,
      proofUrl: proofUrl,
      deliveryTime: new Date(),
      fundsReleased: true, // Auto release funds on delivery (or via 3-word logic later)
      fundsReleaseAt: new Date()
    }
  });

  // Log action
  await prisma.auditLog.create({
      data: {
          executorId: user.id,
          action: "COMPLETE_DELIVERY",
          entity: "Order",
          entityId: orderId,
          metadata: JSON.stringify({ lat, lng, proofOr: proofUrl })
      }
  });

  revalidatePath("/delivery");
  redirect("/delivery");
}

export async function assignOrderToMe(orderId: string, formData: FormData) {
    const user = await requireUser();
    
    // Check if order is still available
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (order.courierId) throw new Error("This order is already taken");

    await prisma.order.update({
        where: { id: orderId },
        data: {
            courierId: user.id,
            deliveryStatus: DeliveryStatus.ON_WAY // Or ASSIGNED. ON_WAY makes it active immediately.
        }
    });

    revalidatePath("/delivery");
}
