"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveUploadedFile } from "@/lib/file-upload";

const ALLOWED_DOC_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

async function saveDoc(file: File | null) {
    if (!file || file.size === 0) return null;
    
    if (file.size > MAX_DOC_SIZE) {
        throw new Error(`El archivo ${file.name} es muy grande (Máx 10MB).`);
    }
    // Simple verification, strict check can be added
    // if (!ALLOWED_DOC_TYPES.includes(file.type)) ... 

    return await saveUploadedFile(file, "documents");
}

export async function submitPartnerRequest(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const vehicleType = formData.get("vehicleType") as string;
    const vehicleModelYear = Number(formData.get("vehicleModelYear"));

    if (!fullName || !email || !phone || !vehicleType) {
        throw new Error("Campos obligatorios faltantes");
    }

    // Process Files
    const cedulaUrl = await saveDoc(formData.get("cedulaFile") as File);
    const vtvUrl = await saveDoc(formData.get("vtvFile") as File);
    const seguroUrl = await saveDoc(formData.get("seguroFile") as File);
    const cuitUrl = await saveDoc(formData.get("cuitFile") as File);
    const antecedentesUrl = await saveDoc(formData.get("antecedentesFile") as File);
    const licenciaUrl = await saveDoc(formData.get("licenciaFile") as File);

    await prisma.partnerRequest.create({
        data: {
            fullName,
            email,
            phone,
            vehicleType,
            vehicleModelYear: vehicleModelYear || null,
            status: "PENDING",
            // Docs
            cedulaUrl,
            vtvUrl,
            seguroUrl,
            cuitUrl,
            antecedentesUrl,
            licenciaUrl
        }
    });
    
    revalidatePath("/partner-request");
    return { success: true };
}
