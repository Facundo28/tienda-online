"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

export async function createProductQuestion(productId: string, formData: FormData) {
  const user = await requireUser();

  const text = String(formData.get("text") || "").trim();
  if (!text) throw new Error("Escribí una pregunta");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true },
  });

  if (!product || !product.isActive) throw new Error("Producto no encontrado");

  await prisma.productQuestion.create({
    data: {
      productId,
      userId: user.id,
      text,
    },
  });

  revalidatePath(`/products/${productId}`);
}
