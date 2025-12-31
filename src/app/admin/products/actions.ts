"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveUploadedFile } from "@/lib/file-upload";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function saveUploadedImage(image: File) {
  if (image.size > MAX_IMAGE_BYTES) {
    throw new Error(`La imagen ${image.name} supera el tamaño máximo de 10MB.`);
  }
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    throw new Error(`El tipo de archivo ${image.type} no es válido. Solo JPEG, PNG y WebP.`);
  }
  return await saveUploadedFile(image, "products");
}

async function saveUploadedImages(files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    if (file.size <= 0) continue;
    urls.push(await saveUploadedImage(file));
  }
  return urls;
}

function parseStock(formData: FormData): number {
    const stockRaw = formData.get("stock");
    const stock = Number(stockRaw);
    if (!Number.isFinite(stock)) return 1;
    return Math.max(0, Math.floor(stock));
}

function parseCondition(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "USED"; 
  const raw = value.trim().toUpperCase();
  if (["NEW", "USED", "REFURBISHED"].includes(raw)) {
    return raw;
  }
  return "USED";
}

function parseCategory(value: FormDataEntryValue | null): string {
   if (typeof value !== "string") return "OTROS";
   return value.trim();
}

function parsePriceCents(formData: FormData): number {
  const priceRaw = formData.get("price");
  if (typeof priceRaw === "string") {
    // Replace comma with dot for locales like ES
    const normalized = priceRaw.trim().replace(",", ".");
    const val = parseFloat(normalized);
    if (Number.isFinite(val)) return Math.round(val * 100);
  }
  // Fallback to direct priceCents if present
  const cents = Number(formData.get("priceCents"));
  return Number.isFinite(cents) ? cents : 0;
}

export async function createProduct(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = parseCategory(formData.get("category"));
  const priceCents = parsePriceCents(formData);
  const stock = parseStock(formData);
  const condition = parseCondition(formData.get("condition"));
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);

  if (!name || !description || !priceCents) {
    throw new Error("Nombre, descripción y precio son requeridos");
  }

  // Combine manual URLs (from existing or pasted) and New Uploads
  const manualUrls = imageUrl ? imageUrl.split(/[\n,]+/g).map((s) => s.trim()).filter(Boolean) : [];
  const uploadedUrls = imageFiles.length > 0 ? await saveUploadedImages(imageFiles) : [];
  
  const finalUrls = [...uploadedUrls, ...manualUrls].slice(0, 5); // Max 5
  const finalImageUrl: string | null = finalUrls.length > 0 ? finalUrls.join("\n") : null;

  await prisma.product.create({
    data: {
      name,
      description,
      category: category as any,
      userId: user.id,
      priceCents,
      stock,
      condition: condition as any,
      imageUrl: finalImageUrl,
      isActive: true, // Default active
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/vender");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await requireUser();
  
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Producto no encontrado");
  if (product.userId !== user.id && user.role !== "ADMIN") {
      throw new Error("No tienes permiso");
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = parseCategory(formData.get("category"));
  const priceCents = parsePriceCents(formData);
  const stock = parseStock(formData);
  const condition = parseCondition(formData.get("condition"));
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);

  if (!name || isNaN(priceCents)) {
    throw new Error("Datos inválidos");
  }

  // Image Logic
  const manualUrls = imageUrl ? imageUrl.split(/[\n,]+/g).map((s) => s.trim()).filter(Boolean) : [];
  const uploadedUrls = imageFiles.length > 0 ? await saveUploadedImages(imageFiles) : [];
  
  const finalUrls = [...manualUrls, ...uploadedUrls].slice(0, 5); 
  const finalImageUrl: string | null = finalUrls.length > 0 ? finalUrls.join("\n") : null;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      category: category as any,
      priceCents,
      stock,
      condition: condition as any,
      imageUrl: finalImageUrl,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/vender");
}

export async function deleteProduct(id: string) {
  const user = await requireUser();
  const product = await prisma.product.findUnique({ where: { id } });
  if(!product) return;
  
  if (product.userId !== user.id && user.role !== "ADMIN") {
      throw new Error("No autorizado");
  }

  // Soft Delete mainly to preserve order history
  await prisma.product.update({
       where: { id },
       data: { 
           isActive: false,
           isDeleted: true 
       }
   });

  revalidatePath("/admin/products");
  revalidatePath("/vender");
}

export async function toggleProduct(id: string, isActive: boolean) {
    const user = await requireUser();
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return;

    if (product.userId !== user.id && user.role !== "ADMIN") {
        throw new Error("No autorizado");
    }

    await prisma.product.update({
        where: { id },
        data: { isActive }
    });
    revalidatePath("/admin/products");
    revalidatePath("/vender");
}
