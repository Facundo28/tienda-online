"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth/session";

export async function setUserActive(userId: string, isActive: boolean) {
  await requireAdmin();

  const current = await getCurrentUser();
  if (current?.id === userId) {
    throw new Error("No puedes desactivar tu propio usuario");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  revalidatePath("/admin/users");
}

export async function setUserRole(userId: string, role: "USER" | "ADMIN") {
  await requireAdmin();

  const current = await getCurrentUser();
  if (current?.id === userId && role !== "ADMIN") {
    throw new Error("No puedes quitarte el rol ADMIN a ti mismo");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  const current = await getCurrentUser();
  if (current?.id === userId) {
    throw new Error("No puedes eliminar tu propio usuario");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    revalidatePath("/admin/users");
    return;
  }

  if (user.role === "ADMIN") {
    const adminsCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });

    if (adminsCount <= 1) {
      throw new Error("No puedes eliminar el último ADMIN activo");
    }
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
}
