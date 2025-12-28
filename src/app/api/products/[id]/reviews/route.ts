import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { z } from "zod";

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: productId } = await params;
    const json = await req.json();
    
    const result = createReviewSchema.safeParse(json);
    if (!result.success) {
        return NextResponse.json({ error: (result as any).error.issues || (result as any).error.errors }, { status: 400 });
    }
    const body = result.data;

    // Optional: Check if user purchased product (Verified Review)
    // For now, allow any logged-in user to review (Mercado Libre allows questions, but reviews usually need purchase)
    // Let's implement basic "One review per product per user" constraint
    
    const existingReview = await prisma.review.findFirst({
        where: {
            userId: user.id,
            productId: productId
        }
    });

    if (existingReview) {
        return NextResponse.json(
            { error: "Ya has calificado este producto." },
            { status: 400 }
        );
    }

    const review = await prisma.review.create({
      data: {
        rating: body.rating,
        comment: body.comment,
        productId,
        userId: user.id,
      },
      include: {
        user: {
            select: {
                name: true,
                avatarUrl: true
            }
        }
      }
    });

    // Update Seller Reputation
    // We already have productId -> fetch product owner
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { userId: true }
    });
    if (product?.userId) {
         import("@/lib/reputation").then(({ updateReputation }) => {
             updateReputation(product.userId as string);
         });
    }

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("REVIEW ERROR:", error);
    return NextResponse.json(
      { error: "Error al crear la reseña: " + (error.message || "Unknown error") }, 
      { status: 500 }
    );
  }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: productId } = await params;
    
    const reviews = await prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    name: true,
                    avatarUrl: true
                }
            }
        }
    });

    return NextResponse.json(reviews);
}
