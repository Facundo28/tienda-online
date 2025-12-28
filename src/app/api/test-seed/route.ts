
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole, DeliveryMethod, DeliveryStatus } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/auth/password";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const promoteEmail = searchParams.get("promote");
    
    if (promoteEmail) {
      await prisma.user.update({
        where: { email: promoteEmail },
        data: { role: UserRole.ADMIN },
      });
    }

    // 1. Upsert Admin (Dummy) - kept for reference
    const adminEmail = "admin@test.com";
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: UserRole.ADMIN },
      create: {
        email: adminEmail,
        name: "Admin Test",
        passwordHash: await hashPassword("admin123"),
        role: UserRole.ADMIN,
      },
    });

    // 2. Ensure a Product exists
    let product = await prisma.product.findFirst({
        where: { name: "Producto Pruebas" }
    });
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: "Producto Pruebas",
          description: "Descripcion de prueba",
          priceCents: 10000,
          imageUrl: "/placeholder.jpg",
        },
      });
    }

    // 3. Create Pickup Order
    const code = "TEST1234";
    // Clean up old test order
    await prisma.order.deleteMany({ where: { pickupCode: code } });
    
    const order = await prisma.order.create({
      data: {
        customerName: "Cliente Test",
        customerEmail: "cliente@test.com",
        addressLine1: "Test Address",
        city: "Test City",
        state: "Test State",
        postalCode: "1234",
        totalCents: 10000,
        deliveryMethod: DeliveryMethod.PICKUP,
        deliveryStatus: DeliveryStatus.PENDING,
        pickupCode: code,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            priceCents: 10000,
          },
        },
      },
      include: { items: true }
    });

    // 4. Create Logistics Company & Driver
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

    const driverEmail = "driver@test.com";
    const driver = await prisma.user.upsert({
        where: { email: driverEmail },
        update: { 
            role: UserRole.DRIVER,
            workerOfId: company.id 
        },
        create: {
            email: driverEmail,
            name: "Repartidor Juan",
            passwordHash: await hashPassword("driver123"),
            role: UserRole.DRIVER,
            workerOfId: company.id
        }
    });

    // 5. Create Delivery Order
    // Keywords fixed for testing
    const securityWords = "ROJO-MESA-PATO";
    
    const deliveryOrder = await prisma.order.create({
      data: {
        customerName: "Maria Destinataria",
        customerEmail: "maria@test.com",
        customerPhone: "1155556666",
        addressLine1: "Av. Corrientes 1234",
        city: "Buenos Aires",
        state: "CABA",
        postalCode: "1000",
        totalCents: 5000,
        deliveryMethod: DeliveryMethod.DELIVERY,
        deliveryStatus: DeliveryStatus.ASSIGNED,
        securityKeywords: securityWords,
        courierId: driver.id,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            priceCents: 5000,
          },
        },
      }
    });

    return NextResponse.json({ 
        success: true, 
        credentials: {
            driver: { email: driverEmail, password: "Debes setear password o usar magic link" },
            admin: { email: adminEmail }
        },
        deliveryOrder: {
            id: deliveryOrder.id,
            keywords: securityWords,
            address: deliveryOrder.addressLine1
        }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
