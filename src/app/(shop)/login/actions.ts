"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
  require2FA?: boolean;
  userId?: string;
  methods?: string[];
  message?: string;
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

  // 2. 2FA Check
  const enabledMethods = user.enabled2FAMethods ? user.enabled2FAMethods.split(",") : [];
  
  if (enabledMethods.length > 0) {
      // Logic to send initial code if SMS/EMAIL is primary (simplified: send to all non-APP)
      if (enabledMethods.includes("EMAIL")) {
          // Send Email Code
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          await prisma.user.update({
             where: { id: user.id },
             data: { otpCode: code, otpExpiresAt: new Date(Date.now() + 10*60*1000) }
          });
          try {
             const { sendEmail } = await import("@/lib/mail");
             await sendEmail({
                 to: user.email,
                 subject: "Código de Inicio de Sesión",
                 html: `<p>Tu código es: <b>${code}</b></p>`
             });
          } catch(e) { console.error("Login Email Failed", e); }
      }
      // Return Challenge
      return { 
          require2FA: true, 
          userId: user.id, 
          methods: enabledMethods, 
          message: "Ingresa el código de verificación." 
      };
  }

  await createSession(user.id);

  // Role-based Redirection
  switch (user.role) {
    case "DRIVER":
      redirect("/delivery");
    case "LOGISTICS_ADMIN":
      redirect("/logistics");
    case "ADMIN":
      redirect("/admin");
    default:
      redirect("/");
  }
}

export async function verifyLogin2FA(_prevState: LoginState, formData: FormData) {
    const userId = String(formData.get("userId"));
    const code = String(formData.get("code"));

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Usuario inválido" };

    let isValid = false;
    const methods = user.enabled2FAMethods ? user.enabled2FAMethods.split(",") : [];

    // Check TOTP (APP)
    if (methods.includes("APP") && user.twoFactorSecret) {
        const { authenticator } = await import("otplib");
        if (authenticator.check(code, user.twoFactorSecret)) {
            isValid = true;
        }
    }

    // Check OTP (EMAIL/SMS)
    if (!isValid && (methods.includes("EMAIL") || methods.includes("SMS"))) {
        if (user.otpCode === code && user.otpExpiresAt && new Date() < user.otpExpiresAt) {
            isValid = true;
            // Clear used code
            await prisma.user.update({ 
                where: { id: user.id }, 
                data: { otpCode: null, otpExpiresAt: null } 
            });
        }
    }

    if (!isValid) {
        return { 
            error: "Código incorrecto o expirado", 
            require2FA: true, 
            userId, 
            methods 
        };
    }

    await createSession(user.id);

    switch (user.role) {
      case "DRIVER": redirect("/delivery");
      case "LOGISTICS_ADMIN": redirect("/logistics");
      case "ADMIN": redirect("/admin");
      default: redirect("/");
    }
}
