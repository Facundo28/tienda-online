"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

const INVALID_CREDENTIALS_MESSAGE =
  "Nombre de usuario y/o contraseña incorrecto";

export async function login(_prevState: LoginState, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: INVALID_CREDENTIALS_MESSAGE } satisfies LoginState;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { error: INVALID_CREDENTIALS_MESSAGE } satisfies LoginState;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: INVALID_CREDENTIALS_MESSAGE } satisfies LoginState;
  }

  await createSession(user.id);
  redirect("/");
}
