"use server";



import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

import { saveUploadedFile } from "@/lib/storage";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const emailRaw = String(formData.get("email") || "");
  const email = normalizeEmail(emailRaw);
  const avatarFile = formData.get("avatar");
  
  // KYC Fields
  const dni = String(formData.get("dni") || "").trim();
  const documentFrontFile = formData.get("documentFront");
  const documentBackFile = formData.get("documentBack");
  const identitySelfieFile = formData.get("identitySelfie");

  const phone = String(formData.get("customerPhone") || "").trim();
  const phoneCountryCode = String(formData.get("phoneCountryCode") || "").trim();
  // Address fields...
  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const addressLine2 = String(formData.get("addressLine2") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const postalCode = String(formData.get("postalCode") || "").trim();

  if (!name) throw new Error("El nombre es requerido");
  if (!email || !email.includes("@")) {
    throw new Error("Email inválido");
  }

  // Handle File Uploads
  let avatarUrl: string | undefined;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    avatarUrl = await saveUploadedFile(avatarFile, "avatars");
  }
  
  let documentFrontUrl: string | undefined;
  if (documentFrontFile instanceof File && documentFrontFile.size > 0) {
    documentFrontUrl = await saveUploadedFile(documentFrontFile, "identity");
  }

  let documentBackUrl: string | undefined;
  if (documentBackFile instanceof File && documentBackFile.size > 0) {
    documentBackUrl = await saveUploadedFile(documentBackFile, "identity");
  }
  
  let identitySelfieUrl: string | undefined;
  if (identitySelfieFile instanceof File && identitySelfieFile.size > 0) {
    identitySelfieUrl = await saveUploadedFile(identitySelfieFile, "identity");
  }

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== user.id) {
      throw new Error("Ese email ya está en uso");
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      phone: phone || null,
      phoneCountryCode: phoneCountryCode || null,
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      dni: dni || null,
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(documentFrontUrl ? { documentFrontUrl } : {}),
      ...(documentBackUrl ? { documentBackUrl } : {}),
      ...(identitySelfieUrl ? { identitySelfieUrl } : {}),
    },
  });

  revalidatePath("/");
  redirect("/account");
}

export async function updateUserPremiumProfile(formData: FormData) {
  const user = await requireUser();

  // Validate Premium Status
  if (!user.membershipExpiresAt || user.membershipExpiresAt < new Date()) {
      throw new Error("Must be a Premium member to edit this");
  }

  const instagram = formData.get("instagram") as string;
  const facebook = formData.get("facebook") as string;
  const website = formData.get("website") as string;
  const storeName = formData.get("storeName") as string;
  const bannerFile = formData.get("banner");

  console.log("SERVER UPLOAD DEBUG:", { 
      storeName,
      bannerFileIsNull: bannerFile === null,
      bannerFileType: typeof bannerFile,
      isInstanceFile: bannerFile instanceof File,
      size: (bannerFile instanceof File) ? bannerFile.size : "N/A",
      name: (bannerFile instanceof File) ? bannerFile.name : "N/A"
  });

  let bannerUrl: string | undefined;

  if (bannerFile instanceof File && bannerFile.size > 0) {
    bannerUrl = await saveUploadedFile(bannerFile, "banners");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
        storeName: storeName || null,
        socialInstagram: instagram,
        socialFacebook: facebook,
        socialWebsite: website,
        ...(bannerUrl ? { bannerUrl } : {}),
    }
  });

  revalidatePath("/account");
  revalidatePath(`/users/${user.id}`); // Public profile
}
