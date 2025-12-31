"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

import { saveUploadedFile } from "@/lib/file-upload";

// --- BANNERS ---

export async function createAdBanner(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  let imageUrl = formData.get("imageUrl") as string;
  const imageFile = formData.get("imageFile") as File;
  const redirectUrl = formData.get("redirectUrl") as string;
  const position = formData.get("position") as string || "HOME_MAIN";

  if (imageFile && imageFile.size > 0) {
      imageUrl = await saveUploadedFile(imageFile, "banners");
  }

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
  return { success: true };
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

// --- ANNOUNCEMENTS (MARQUESINA) ---

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();

  const text = formData.get("text") as string;
  if (!text) return;

  await prisma.announcement.create({
    data: {
      text,
      isActive: true
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/ads");
}

export async function toggleAnnouncement(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.announcement.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/");
  revalidatePath("/admin/ads");
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/ads");
}
