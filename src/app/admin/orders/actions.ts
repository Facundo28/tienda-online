"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

export async function forceUpdateOrderStatus(orderId: string, newStatus: string) {
  await requireAdmin();

  const validStatuses = ["PENDING", "PAID", "FAILED", "DISPUTED"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado no válido");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus as any },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function forceUpdateDeliveryStatus(orderId: string, newStatus: string) {
    await requireAdmin();
  
    const validStatuses = ["PENDING", "ON_WAY", "DELIVERED", "FAILED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Estado de envío no válido");
    }
  
    await prisma.order.update({
      where: { id: orderId },
      data: { deliveryStatus: newStatus as any },
    });
  
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
  }
