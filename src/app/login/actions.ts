"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    throw new Error("Email y contraseña son requeridos");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new Error("Credenciales inválidas");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new Error("Credenciales inválidas");
  }

  await createSession(user.id);
  redirect("/");
}
