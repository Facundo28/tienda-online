import { prisma } from "../lib/prisma";

async function main() {
  console.log("Creating Orphan Order...");

  // ensure product
  const product = await prisma.product.findFirst();
  if (!product) throw new Error("No products found");

  const order = await prisma.order.create({
      data: {
          customerName: "Cliente Esperando Asignacion",
          customerEmail: "esperando@test.com",
          addressLine1: "Calle Falsa 123 (Pool)",
          city: "Buenos Aires",
          state: "CABA",
          postalCode: "2000",
          totalCents: 8500,
          deliveryMethod: "DELIVERY",
          deliveryStatus: "PENDING",
          courierId: null, // <--- No courier!
          fundsReleased: false,
          securityKeywords: "LIBRO-VERDE-SOL",
          items: {
              create: {
                  productId: product.id,
                  quantity: 2,
                  priceCents: product.priceCents
              }
          }
      }
  });

  console.log("Orphan Order Created:", order.id);
  console.log("Check the Driver Dashboard now!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
