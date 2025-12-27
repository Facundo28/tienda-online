"use server";

import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function saveUploadedImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Formato de imagen no permitido (usa JPG/PNG/WebP)");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen es demasiado grande (máx 5MB)");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}

export async function createProduct(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceCents = Math.max(
    0,
    Math.floor(Number(formData.get("priceCents") || 0)),
  );
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageFile = formData.get("image");

  if (!name || !description || !priceCents) {
    throw new Error("Nombre, descripción y precio son requeridos");
  }

  let finalImageUrl: string | null = imageUrl || null;
  if (imageFile instanceof File && imageFile.size > 0) {
    finalImageUrl = await saveUploadedImage(imageFile);
  }

  await prisma.product.create({
    data: {
      name,
      description,
      priceCents,
      imageUrl: finalImageUrl,
      isActive: true,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProduct(productId: string, isActive: boolean) {
  await requireUser();
  await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  await requireUser();
  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}
