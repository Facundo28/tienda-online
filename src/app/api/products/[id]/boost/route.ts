import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@/generated/prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  // Basic authorization: Only admins or the product owner (conceptually) can boost
  // For this MVP, we'll restrict to ADMIN to keep it simple, or checking user role
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params; // Next.js 15 requires awaiting params
  
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  // Calculate new boost expiration date (Current time + 7 days)
  const boostDurationDays = 7;
  const boostedUntil = new Date();
  boostedUntil.setDate(boostedUntil.getDate() + boostDurationDays);

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        boostedUntil: boostedUntil,
      },
      select: {
        id: true,
        name: true,
        boostedUntil: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: `Producto destacado hasta ${boostedUntil.toLocaleDateString()}`,
    });
  } catch (error) {
    console.error("Error boosting product:", error);
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}
