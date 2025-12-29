"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

export async function createAdBanner(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const redirectUrl = formData.get("redirectUrl") as string;
  const position = formData.get("position") as string || "HOME_MAIN";

  if (!title || !imageUrl) {
    throw new Error("Missing required fields");
  }

  await prisma.adBanner.create({
    data: {
      title,
      imageUrl,
      redirectUrl: redirectUrl || null,
      position,
      isActive: true,
    },
  });

  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function deleteAdBanner(id: string) {
  await requireAdmin();
  
  await prisma.adBanner.delete({
    where: { id },
  });

  revalidatePath("/admin/ads");
}

export async function toggleAdBanner(id: string, isActive: boolean) {
  await requireAdmin();

  await prisma.adBanner.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/ads");
}
