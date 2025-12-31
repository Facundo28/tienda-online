"use server";

import { authenticator } from "otplib";
import qrcode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { sendEmail } from "@/lib/mail";
import { sendSMS } from "@/lib/sms";

// --- HELPERS ---

function getEnabledMethods(user: any): string[] {
    return user.enabled2FAMethods ? user.enabled2FAMethods.split(",") : [];
}

async function updateMethods(userId: string, methods: string[]) {
    await prisma.user.update({
        where: { id: userId },
        data: { enabled2FAMethods: methods.join(",") }
    });
    revalidatePath("/account/security");
}

// --- TOTP (APP) ---

export async function generateTwoFactorSecret() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) throw new Error("Usuario no encontrado");

  // Always generate new secret for setup
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, "TiendaOnline", secret);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret },
  });

  const qrCodeUrl = await qrcode.toDataURL(otpauth);
  return { secret, qrCodeUrl };
}

export async function verifyAndEnableAPP(token: string) {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user?.twoFactorSecret) throw new Error("Configuración no iniciada.");

  if (!authenticator.check(token, user.twoFactorSecret)) {
      throw new Error("Código incorrecto.");
  }

  const methods = getEnabledMethods(user);
  if (!methods.includes("APP")) {
       methods.push("APP");
       await updateMethods(user.id, methods);
  }

  return { success: true };
}

// --- OTP (EMAIL / SMS) ---

export async function sendOTP(channel: "EMAIL" | "SMS") {
    const sessionUser = await requireUser();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) throw new Error("Usuario no encontrado");

    if (channel === "SMS" && !user.phone) {
        throw new Error("Debes registrar un teléfono en tu perfil primero.");
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: code, otpExpiresAt: expiresAt }
    });

    if (channel === "SMS") {
        await sendSMS({
            to: `${user.phoneCountryCode || "+54"}${user.phone}`,
            body: `Tu codigo de seguridad Market E.C es: ${code}. No lo compartas.`
        });
    } else {
        // REAL EMAIL SENDING
        await sendEmail({
            to: user.email,
            subject: "Tu Código de Verificación - Market E.C",
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #f3f4f6;">
                    <div style="background: white; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto;">
                        <h2 style="color: #12753e; margin-top: 0;">Código de Seguridad</h2>
                        <p>Usa el siguiente código para completar tu acción en Market E.C:</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 24px 0; color: #111;">
                            ${code}
                        </div>
                        <p style="font-size: 12px; color: #666;">Este código expira en 10 minutos. No lo compartas con nadie.</p>
                    </div>
                </div>
            `
        });
    }
    
    return { success: true, message: `Código enviado por ${channel === "SMS" ? "SMS" : "Email"}` };
}

export async function verifyAndEnableOTP(channel: "EMAIL" | "SMS", code: string) {
    const sessionUser = await requireUser();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user || !user.otpCode || !user.otpExpiresAt) throw new Error("Solicita un nuevo código.");

    if (new Date() > user.otpExpiresAt) throw new Error("El código ha expirado.");
    if (user.otpCode !== code) throw new Error("Código incorrecto.");

    // Clear code (prevent reuse)
    await prisma.user.update({ 
        where: { id: user.id }, 
        data: { otpCode: null, otpExpiresAt: null } 
    });

    const methods = getEnabledMethods(user);
    if (!methods.includes(channel)) {
        methods.push(channel);
        await updateMethods(user.id, methods);
    }
}

// --- GENERAL ---

export async function disableMethod(method: "APP" | "EMAIL" | "SMS") {
    const sessionUser = await requireUser();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if(!user) return;

    let methods = getEnabledMethods(user);
    methods = methods.filter(m => m !== method);
    
    await updateMethods(user.id, methods);
}

export async function updatePassword(current: string, newPass: string) {
    const sessionUser = await requireUser();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) throw new Error("Usuario no encontrado");

    // Verify current (users created via social logic might require set password logic, but assuming passwordHash exists)
    const isValid = await verifyPassword(current, user.passwordHash);
    if (!isValid) throw new Error("La contraseña actual es incorrecta");

    const newHash = await hashPassword(newPass);
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
    });

    // Optional: clear other sessions? For now keep logged in.
    return { success: true };
}
