"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function register(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) {
    throw new Error("Nombre, email y contraseña son requeridos");
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Ese email ya está registrado");
  }

  const usersCount = await prisma.user.count();
  const role = usersCount === 0 ? "ADMIN" : "USER";

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      isActive: true,
    },
    select: { id: true },
  });

  await createSession(user.id);
  redirect("/");
}
