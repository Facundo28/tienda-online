import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // 1. Admin
  const adminEmail = "admin@test.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin Test",
      passwordHash: await hashPassword("admin123"),
      role: "ADMIN",
    },
  });
  console.log("Admin created:", adminEmail);

  // 2. Logistics Company (Flash Envios)
  const company = await prisma.logisticsCompany.upsert({
      where: { ownerId: admin.id },
      create: {
          name: "Flash Envíos S.A.",
          cuit: "30-12345678-9",
          phone: "1122334455",
          email: "logistica@test.com",
          ownerId: admin.id,
          isActive: true,
          isVerified: true
      },
      update: {}
  });
  console.log("Company created:", company.name);

  // 3. Driver (Repartidor Juan)
  const driverEmail = "driver@test.com";
  const driver = await prisma.user.upsert({
      where: { email: driverEmail },
      update: { role: "DRIVER", workerOfId: company.id },
      create: {
          email: driverEmail,
          name: "Repartidor Juan",
          passwordHash: await hashPassword("driver123"),
          role: "DRIVER",
          workerOfId: company.id
      }
  });
  console.log("Driver created:", driverEmail);

  // 4. Product
  let product = await prisma.product.findFirst({ where: { name: "Caja Sorpresa" } });
  if (!product) {
      product = await prisma.product.create({
          data: {
              name: "Caja Sorpresa",
              description: "Un paquete misterioso",
              priceCents: 5000,
              imageUrl: "/placeholder.png"
          }
      });
  }

  // 5. Test Delivery Order
  const order = await prisma.order.create({
      data: {
          customerName: "Maria Destinataria",
          customerEmail: "maria@test.com",
          addressLine1: "Av. Corrientes 1234",
          city: "Buenos Aires",
          state: "CABA",
          postalCode: "1000",
          totalCents: 5000,
          deliveryMethod: "DELIVERY",
          deliveryStatus: "ASSIGNED",
          courierId: driver.id,
          securityKeywords: "ROJO-MESA-PATO",
          items: {
              create: {
                  productId: product.id,
                  quantity: 1,
                  priceCents: 5000
              }
          }
      }
  });

  console.log("Order created:", order.id);
  console.log("KEYWORDS:", order.securityKeywords);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
