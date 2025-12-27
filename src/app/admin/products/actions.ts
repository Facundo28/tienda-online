"use server";

import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ProductCategory } from "@/generated/prisma/enums";

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

function parseCategory(value: FormDataEntryValue | null): ProductCategory {
  if (typeof value !== "string") return ProductCategory.OTROS;
  const raw = value.trim();
  if (Object.values(ProductCategory).includes(raw as ProductCategory)) {
    return raw as ProductCategory;
  }
  return ProductCategory.OTROS;
}

export async function createProduct(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = parseCategory(formData.get("category"));
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
      category,
      userId: user.id,
      priceCents,
      imageUrl: finalImageUrl,
      isActive: true,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProduct(productId: string, isActive: boolean) {
  const user = await requireUser();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { userId: true },
  });

  if (!product) throw new Error("Producto no encontrado");
  if (user.role !== "ADMIN" && product.userId !== user.id) {
    throw new Error("No autorizado");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const user = await requireUser();

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { userId: true, imageUrl: true },
  });

  if (!existing) throw new Error("Producto no encontrado");
  if (user.role !== "ADMIN" && existing.userId !== user.id) {
    throw new Error("No autorizado");
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = parseCategory(formData.get("category"));
  const priceCents = Math.max(
    0,
    Math.floor(Number(formData.get("priceCents") || 0)),
  );

  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageFile = formData.get("image");

  if (!name || !description || !priceCents) {
    throw new Error("Nombre, descripción y precio son requeridos");
  }

  let nextImageUrl: string | null | undefined = undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    nextImageUrl = await saveUploadedImage(imageFile);
  } else if (imageUrl) {
    nextImageUrl = imageUrl;
  } else {
    nextImageUrl = existing.imageUrl;
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      category,
      priceCents,
      imageUrl: nextImageUrl,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  const user = await requireUser();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { userId: true },
  });

  if (!product) throw new Error("Producto no encontrado");
  if (user.role !== "ADMIN" && product.userId !== user.id) {
    throw new Error("No autorizado");
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}
