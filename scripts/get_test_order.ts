const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find any order with DELIVERY method
  const order = await prisma.order.findFirst({
    where: { deliveryMethod: 'DELIVERY' },
    select: { id: true }
  });

  if (order) {
    console.log(`TEST_ORDER_ID:${order.id}`);
  } else {
    // Create one if none exists
    const newOrder = await prisma.order.create({
        data: {
            customerName: "Test Customer",
            customerEmail: "test@test.com",
            addressLine1: "Calle Falsa 123",
            city: "Test City",
            state: "Test State",
            postalCode: "1234",
            totalCents: 1000,
            deliveryMethod: "DELIVERY",
            deliveryStatus: "PENDING",
            // Need a user?
        }
    });
    console.log(`TEST_ORDER_ID:${newOrder.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
