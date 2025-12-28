import { prisma } from "@/lib/prisma";
import { ReputationTier } from "@/generated/prisma/client";

export async function updateReputation(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        products: {
            include: {
                reviews: true
            }
        },
        orders: true 
        // Note: 'orders' here are *purchases*, we need 'sales'.
        // Sales are Orders where items.product.userId === userId.
        // It's expensive to query.
        // Simplified: We assume products have reviews.
        // Better: Query Sales count.
    }
  });

  if (!user) return;

  // 1. Calculate Sales Count
  const salesCount = await prisma.orderItem.count({
    where: {
        product: {
            userId: userId
        },
        order: {
            status: "FULFILLED" // or PAID
        }
    }
  });

  // 2. Average Rating
  const products = await prisma.product.findMany({
    where: { userId },
    include: { reviews: true }
  });
  
  let totalRating = 0;
  let reviewCount = 0;
  
  products.forEach(p => {
    p.reviews.forEach(r => {
        totalRating += r.rating;
        reviewCount++;
    });
  });

  const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;

  // 3. Calculation
  // Base 20.
  // Each sale +1 (max 30).
  // Rating: (Avg / 5) * 40 (max 40).
  // Verified: +10.
  
  let score = 20;
  score += Math.min(salesCount * 1, 30);
  if (reviewCount > 0) {
      score += (avgRating / 5) * 40;
  }
  if (user.isVerified) {
      score += 10;
  }

  // Cap
  score = Math.min(Math.max(Math.round(score), 0), 100);

  // 4. Determine Tier
  let tier: ReputationTier = "ROJO";
  if (score >= 95) tier = "PLATINUM";
  else if (score >= 80) tier = "VERDE";
  else if (score >= 50) tier = "AMARILLO";
  else if (score >= 20) tier = "NARANJA";

  // 5. Update
  await prisma.user.update({
    where: { id: userId },
    data: {
        reputationScore: score,
        reputationTier: tier
    }
  });

  return { score, tier };
}
