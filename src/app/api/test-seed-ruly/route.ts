
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🌱 Seeding Ruly S.A. Logistics...');

    // 1. Create Logistics Owner (Ruly)
    const rulyEmail = 'ruly@logistica.com';
    const rulyPassword = await hash('123456', 12);

    const ruly = await prisma.user.upsert({
      where: { email: rulyEmail },
      update: {
        role: UserRole.LOGISTICS_ADMIN,
        isVerified: true,
        passwordHash: rulyPassword
      },
      create: {
        email: rulyEmail,
        name: 'Ruly Owner',
        passwordHash: rulyPassword,
        role: UserRole.LOGISTICS_ADMIN,
        isVerified: true
      }
    });

    // 2. Create Logistics Company
    const company = await prisma.logisticsCompany.upsert({
      where: { ownerId: ruly.id },
      update: {
        name: 'Ruly S.A.',
        isVerified: true,
        cuit: '30-12345678-9',
        phone: '11-5555-9090',
        email: rulyEmail
      },
      create: {
        ownerId: ruly.id,
        name: 'Ruly S.A.',
        cuit: '30-12345678-9',
        phone: '11-5555-9090',
        email: rulyEmail,
        isVerified: true,
        address: 'Calle Falsa 123, Central Logística'
      }
    });

    // 3. Create a Worker for Ruly
    const workerEmail = 'chofer@ruly.com';
    const workerPassword = await hash('123456', 12);

    await prisma.user.upsert({
      where: { email: workerEmail },
      update: {
         role: UserRole.DRIVER,
         workerOfId: company.id,
         passwordHash: workerPassword,
         isVerified: true
      },
      create: {
        email: workerEmail,
        name: 'Pepe Chofer',
        passwordHash: workerPassword,
        role: UserRole.DRIVER,
        isVerified: true,
        phone: '11-4444-2222',
        workerOfId: company.id
      }
    });

    return NextResponse.json({ success: true, message: "Ruly S.A. seeded successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
