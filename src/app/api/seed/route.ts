import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    console.log("🌱 Starting seed via API...");

    // 1. Clean Database
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.claim.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    // await prisma.logisticsWorker.deleteMany(); // Model does not exist
    await prisma.logisticsCompany.deleteMany();
    await prisma.adBanner.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    console.log("✨ Database cleaned.");

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash("admin", 12);

    // 3. Create Users
    
    // ADMIN
    await prisma.user.create({
        data: {
        name: "Super Admin",
        email: "admin@market.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
        isVerified: true,
        membershipExpiresAt: new Date("2099-12-31"),
        },
    });

    // USER
    await prisma.user.create({
        data: {
        name: "Usuario Demo",
        email: "user@market.com",
        passwordHash: hashedPassword,
        role: "USER",
        isVerified: true,
        },
    });

    // LOGISTICS ADMIN
    const logisticsOwner = await prisma.user.create({
        data: {
        name: "Empresa Demo",
        email: "empresa@market.com",
        passwordHash: hashedPassword,
        role: "LOGISTICS_ADMIN",
        isVerified: true,
        membershipExpiresAt: new Date("2099-12-31"),
        },
    });

    // Company
    const company = await prisma.logisticsCompany.create({
        data: {
        name: "Logística Veloz S.A.",
        cuit: "30-12345678-9",
        address: "Av. Corrientes 1234, CABA",
        email: "empresa@market.com",
        phone: "11-4444-5555",
        ownerId: logisticsOwner.id,
        isVerified: true,
        },
    });

    // DRIVER (Linked to Company)
    await prisma.user.create({
        data: {
        name: "Driver Demo",
        email: "driver@market.com",
        passwordHash: hashedPassword,
        role: "DRIVER",
        isVerified: true,
        workerOfId: company.id,
        vehicleType: "MOTO",
        vehiclePlate: "ABC 123",
        },
    });

    return NextResponse.json({ success: true, message: "Seeding completed" });
  } catch (error) {
    console.error("Seeding failed:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
