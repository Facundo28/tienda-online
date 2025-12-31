import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function main() {
  console.log("Creating banner...");
  
  await prisma.adBanner.create({
    data: {
      title: "Banner de Prueba",
      imageUrl: "https://i.imgur.com/qmupiNj.png",
      position: "HOME_MAIN",
      isActive: true,
      redirectUrl: "/products"
    }
  });

  console.log("✅ Banner created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
