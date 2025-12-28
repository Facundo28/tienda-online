"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function adminVerifyCompany(companyId: string, state: boolean) {
  await requireAdmin();

  await prisma.logisticsCompany.update({
    where: { id: companyId },
    data: { isVerified: state },
  });

  revalidatePath("/admin/companies");
}

export async function adminDeleteCompany(companyId: string) {
    await requireAdmin();
    // This is destructive. Usually soft delete or check for orders.
    // For now, implementing as deletion for cleanup purposes.
    await prisma.logisticsCompany.delete({
        where: { id: companyId }
    });
    revalidatePath("/admin/companies");
}

export async function adminUpdateCompany(companyId: string, data: { name: string; cuit: string; phone: string }) {
    await requireAdmin();
    
    await prisma.logisticsCompany.update({
        where: { id: companyId },
        data: {
            name: data.name,
            cuit: data.cuit,
            phone: data.phone
        }
    });
    revalidatePath(`/admin/companies/${companyId}`);
}

export async function adminDismissWorker(workerId: string) {
    await requireAdmin();
    
    await prisma.user.update({
        where: { id: workerId },
        data: { workerOfId: null }
    });
    // We revalidate the specific page where this is called, or the general listing
    revalidatePath("/admin/companies"); 
}

export async function adminBanWorker(workerId: string) {
    await requireAdmin();
    // Ban means deactivating the user entirely
    await prisma.user.update({
        where: { id: workerId },
        data: { isActive: false }
    });
    revalidatePath("/admin/companies");
}

export async function getCompanyStats(companyId: string) {
    await requireAdmin();
    
    // 1. Get all worker IDs
    const company = await prisma.logisticsCompany.findUnique({
        where: { id: companyId },
        select: { workers: { select: { id: true } } }
    });

    if (!company) return { orders: 0, revenue: 0 };

    const workerIds = company.workers.map(w => w.id);

    // 2. Aggregate Orders delivered by these workers
    if (workerIds.length === 0) return { orders: 0, revenue: 0 };

    const stats = await prisma.order.aggregate({
        where: {
            courierId: { in: workerIds },
            deliveryStatus: "DELIVERED"
        },
        _count: { id: true },
        _sum: { totalCents: true }
    });

    return {
        orders: stats._count.id,
        revenue: stats._sum.totalCents || 0
    };
}
