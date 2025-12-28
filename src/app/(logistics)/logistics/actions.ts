"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole, DeliveryStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function assignOrderAction(orderId: string, courierId: string) {
  const user = await requireUser();

  if (user.role !== UserRole.LOGISTICS_ADMIN && user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      courierId: courierId,
      deliveryStatus: DeliveryStatus.ASSIGNED 
    }
  });

  revalidatePath("/logistics");
}

export async function createWorkerAction(formData: FormData) {
    const user = await requireUser();
    
    // Verify Company Owner
    const company = await prisma.logisticsCompany.findUnique({
        where: { ownerId: user.id }
    });

    if (!company) throw new Error("No tienes empresa registrada");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    // const dni = formData.get("dni") as string; // Not in schema yet

    // Create User account for Worker
    const tempPassword = await hash("123456", 12);
    
    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        // If exists but no company, maybe add?
        // For now, error
        throw new Error("El email ya está registrado");
    }

    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: tempPassword,
            role: "DRIVER",
            phone,
            isVerified: true,
            workerOfId: company.id // Link to company
        }
    });

    revalidatePath("/logistics");
}

export async function deleteWorkerAction(workerId: string) {
    const user = await requireUser();
    // Validate ownership
    const company = await prisma.logisticsCompany.findUnique({ where: { ownerId: user.id } });
    if (!company) throw new Error("Unauthorized");

    const worker = await prisma.user.findUnique({ where: { id: workerId } });
    if (!worker || worker.workerOfId !== company.id) throw new Error("Trabajador no encontrado");

    // Unlink and Downgrade
    await prisma.user.update({
        where: { id: workerId },
        data: { 
            workerOfId: null, 
            role: "USER",
            isActive: false // Deactivate access
        } 
    });

    revalidatePath("/logistics");
}

export async function toggleWorkerStatusAction(workerId: string, isActive: boolean) {
    const user = await requireUser();
    const company = await prisma.logisticsCompany.findUnique({ where: { ownerId: user.id } });
    if (!company) throw new Error("Unauthorized");
    
    const worker = await prisma.user.findUnique({ where: { id: workerId } });
    if (!worker || worker.workerOfId !== company.id) throw new Error("Trabajador no encontrado");
    
    await prisma.user.update({
        where: { id: workerId },
        data: { isActive: isActive } // Use explicit boolean
    });

    revalidatePath("/logistics");
}
