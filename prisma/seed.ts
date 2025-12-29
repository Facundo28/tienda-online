import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import path from "path";

// robustly determine db path
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Clean Database
  console.log("🧹 Cleaning database...");
  try {
      await prisma.review.deleteMany();
      await prisma.orderItem.deleteMany();
      await prisma.claim.deleteMany();
      await prisma.order.deleteMany();
      await prisma.product.deleteMany();
      await prisma.logisticsWorker.deleteMany();
      await prisma.logisticsCompany.deleteMany();
      await prisma.adBanner.deleteMany();
      await prisma.auditLog.deleteMany();
      await prisma.user.deleteMany();
  } catch (e) {
      console.warn("⚠️ Warning during cleanup (tables might be empty or missing):", e);
  }

  console.log("✨ Database cleaned.");

  const hashedPassword = await hashPassword("admin");

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
  console.log("👤 Created Admin: admin@market.com");

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
  console.log("👤 Created User: user@market.com");

  // DRIVER
  const driver = await prisma.user.create({
    data: {
      name: "Driver Demo",
      email: "driver@market.com",
      passwordHash: hashedPassword,
      role: "DRIVER",
      isVerified: true,
    },
  });
  console.log("👤 Created Driver: driver@market.com");

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
  console.log("👤 Created Logistics Owner: empresa@market.com");

  // Company
  const company = await prisma.logisticsCompany.create({
    data: {
      name: "Logística Veloz S.A.",
      cuit: "30-12345678-9",
      address: "Av. Corrientes 1234, CABA",
      ownerId: logisticsOwner.id,
      baseFee: 1500,
      pricePerKm: 100,
      isVerified: true,
    },
  });
  console.log("🚚 Created Logistics Company: Logística Veloz S.A.");

  // Link Driver
  await prisma.logisticsWorker.create({
    data: {
      userId: driver.id,
      companyId: company.id,
      joinedAt: new Date(),
      vehicleType: "MOTORCYCLE",
      vehiclePlate: "ABC 123",
    }
  });

  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

