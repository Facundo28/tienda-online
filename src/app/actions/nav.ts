"use server";

import { prisma } from "@/lib/prisma";

export async function navGetRecentProducts(ids: string[]) {
  if (!ids || ids.length === 0) return [];

  return await prisma.product.findMany({
    where: {
      id: { in: ids },
      isActive: true
    },
    take: 10
  });
}
