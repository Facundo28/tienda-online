"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { revalidatePath } from "next/cache";

// --- Middleware Check ---
async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Acceso denegado: Se requieren permisos de Administrador.");
  }
  return user;
}

// 1. Update Basic Info
export async function adminUpdateUser(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as "USER" | "ADMIN";

  if (!userId || !email) throw new Error("Datos incompletos");

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      phone,
      role,
    },
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

// 2. Toggle Verified Badge
export async function adminToggleVerified(userId: string, isVerified: boolean) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { isVerified },
  });

  revalidatePath(`/admin/users/${userId}`);
}

// 3. Reset Password (God Mode)
export async function adminResetPassword(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!userId || !newPassword || newPassword.length < 6) {
    throw new Error("Contraseña inválida (min 6 caracteres).");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });
  
  // Optional: Invalidate sessions here if we had a session table management
  revalidatePath(`/admin/users/${userId}`);
}

// 4. Disable 2FA (Recovery)
export async function adminDisable2FA(userId: string) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      enabled2FAMethods: "", // Clear all methods
    },
  });

  revalidatePath(`/admin/users/${userId}`);
}
