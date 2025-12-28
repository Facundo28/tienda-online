import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { z } from "zod";

const createClaimSchema = z.object({
  type: z.enum(["NOT_RECEIVED", "DAMAGED", "OTHER"]),
  description: z.string().min(10, "Describe el problema con más detalle (mínimo 10 caracteres)."),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: orderId } = await params;
    const json = await req.json();

    const result = createClaimSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: (result as any).error.issues }, { status: 400 });
    }
    const { type, description } = result.data;

    // Check Order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { claim: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    if (order.userId !== user.id) {
         return NextResponse.json({ error: "No tienes permiso para reclamar esta orden" }, { status: 403 });
    }

    if (order.claim) {
         return NextResponse.json({ error: "Ya existe un reclamo para esta orden" }, { status: 400 });
    }
    
    // Create Claim and Update Order in Transaction
    const claim = await prisma.$transaction(async (tx) => {
        const newClaim = await tx.claim.create({
            data: {
                orderId,
                userId: user.id,
                type,
                description,
                status: 'OPEN'
            }
        });
        
        await tx.order.update({
            where: { id: orderId },
            data: { status: 'DISPUTED' }
        });
        
        return newClaim;
    });

    return NextResponse.json(claim);
  } catch (error: any) {
    console.error("CLAIM ERROR:", error);
    return NextResponse.json(
      { error: "Error al crear reclamo: " + (error.message || "Unknown") }, 
      { status: 500 }
    );
  }
}
