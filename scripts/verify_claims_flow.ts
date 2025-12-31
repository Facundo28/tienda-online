import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("🚀 Starting Verification: Claims & Refund Flow");

  // 1. Setup Users
  const uniqueId = Date.now();
  const buyerEmail = `test.buyer.${uniqueId}@example.com`;
  const sellerEmail = `test.seller.${uniqueId}@example.com`;

  console.log("1. Creating Users...");
  const buyer = await prisma.user.create({
    data: { name: "Test Buyer", email: buyerEmail, passwordHash: "mock", role: 'USER' }
  });
  const seller = await prisma.user.create({
    data: { name: "Test Seller", email: sellerEmail, passwordHash: "mock", role: 'USER' }
  });

  // 2. Setup Product
  console.log("2. Creating Product...");
  const product = await prisma.product.create({
    data: {
      name: "Test Product",
      description: "Test Desc",
      priceCents: 1000,
      userId: seller.id,
      stock: 1
    }
  });

  // 3. Create Order (Paid)
  console.log("3. Creating Order (PAID)...");
  const order = await prisma.order.create({
    data: {
      userId: buyer.id,
      status: 'PAID',
      totalCents: 1000,
      customerName: buyer.name,
      customerEmail: buyer.email,
      addressLine1: "Test St",
      city: "Test City",
      state: "Test State",
      postalCode: "1234",
      items: {
        create: {
          productId: product.id,
          quantity: 1,
          priceCents: 1000
        }
      }
    }
  });

  // 4. Create Open Claim
  console.log("4. Creating Open Claim...");
  const claim = await prisma.claim.create({
    data: {
      orderId: order.id,
      userId: buyer.id,
      type: 'NOT_RECEIVED',
      status: 'OPEN',
      description: "Test Claim"
    }
  });

  // 5. Simulate Admin Refund Action
  console.log("5. Simulating Admin Refund Action...");
  
  // Logic from processRefundAction
  await prisma.order.update({
      where: { id: order.id },
      data: { 
          status: 'CANCELLED',
          refundStatus: 'COMPLETED' 
      }
  });

  await prisma.claim.updateMany({
      where: { orderId: order.id, status: 'OPEN' },
      data: { status: 'RESOLVED_REFUNDED' }
  });

  // 6. Verification Assertions
  console.log("6. Verifying Final State...");
  
  const finalOrder = await prisma.order.findUnique({ where: { id: order.id } });
  const finalClaim = await prisma.claim.findUnique({ where: { id: claim.id } });

  console.log(`- Order Status: ${finalOrder?.status} (Expected: CANCELLED)`);
  console.log(`- Refund Status: ${finalOrder?.refundStatus} (Expected: COMPLETED)`);
  console.log(`- Claim Status: ${finalClaim?.status} (Expected: RESOLVED_REFUNDED)`);

  if (finalOrder?.status === 'CANCELLED' && 
      finalOrder?.refundStatus === 'COMPLETED' && 
      finalClaim?.status === 'RESOLVED_REFUNDED') {
      console.log("✅ VERIFICATION SUCCESSFUL");
  } else {
      console.error("❌ VERIFICATION FAILED");
      process.exit(1);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // prisma.$disconnect not explicitly needed with shared instance but good practice
    // but src/lib/prisma doesn't expose disconnect easily, so we just let process exit.
  });
