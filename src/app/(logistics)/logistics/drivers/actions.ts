"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateWorkerAction(formData: FormData) {
    const user = await requireUser();
    const company = await prisma.logisticsCompany.findUnique({ where: { ownerId: user.id } });
    if (!company) throw new Error("Unauthorized");

    const workerId = formData.get("workerId") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    // Email is identity, generally not editable easily without re-verification, but simple update for now
    const email = formData.get("email") as string;

    const worker = await prisma.user.findUnique({ where: { id: workerId } });
    if (!worker || worker.workerOfId !== company.id) throw new Error("Trabajador no encontrado");

    await prisma.user.update({
        where: { id: workerId },
        data: { name, phone, email }
    });

    revalidatePath("/logistics");
    revalidatePath(`/logistics/drivers`);
    revalidatePath(`/logistics/drivers/${workerId}`);
}
