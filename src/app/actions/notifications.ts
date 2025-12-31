"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    revalidatePath("/");
  } catch (e) {
    console.error("Failed to mark notification as read", e);
  }
}
