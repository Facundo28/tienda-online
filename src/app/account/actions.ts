"use server";

import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function saveUploadedAvatar(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Formato de imagen no permitido (usa JPG/PNG/WebP)");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("La imagen es demasiado grande (máx 5MB)");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const avatarsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(avatarsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(avatarsDir, filename), buffer);

  return `/uploads/avatars/${filename}`;
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const emailRaw = String(formData.get("email") || "");
  const email = normalizeEmail(emailRaw);
  const avatarFile = formData.get("avatar");

  if (!name) throw new Error("El nombre es requerido");
  if (!email || !email.includes("@")) {
    throw new Error("Email inválido");
  }

  let avatarUrl: string | undefined;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    avatarUrl = await saveUploadedAvatar(avatarFile);
  }

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== user.id) {
      throw new Error("Ese email ya está en uso");
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  revalidatePath("/account");
  revalidatePath("/");
  redirect("/account");
}
