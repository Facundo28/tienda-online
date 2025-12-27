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

export async function answerProductQuestion(questionId: string, formData: FormData) {
  const user = await requireUser();

  const answerText = String(formData.get("answerText") || "").trim();
  if (!answerText) throw new Error("Escribí una respuesta");

  const question = await prisma.productQuestion.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      productId: true,
      product: { select: { userId: true, isActive: true } },
    },
  });

  if (!question || !question.product?.isActive) {
    throw new Error("Pregunta no encontrada");
  }

  if (!question.product.userId || question.product.userId !== user.id) {
    throw new Error("Solo el dueño del producto puede responder");
  }

  await prisma.productQuestion.update({
    where: { id: questionId },
    data: {
      answerText,
      answeredAt: new Date(),
    },
  });

  revalidatePath(`/products/${question.productId}`);
}
