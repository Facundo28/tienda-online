
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole, DeliveryMethod, DeliveryStatus } from "@/generated/prisma/enums";

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
        passwordHash: "irrelevant",
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

    return NextResponse.json({ success: true, admin, product, order, promoted: promoteEmail });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
