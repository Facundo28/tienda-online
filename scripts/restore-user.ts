import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";
import bcrypt from 'bcryptjs';

const sqliteFilePath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'kevinleoleo789@gmail.com';
  const password = 'blizzter';
  const name = 'Kevin Admin'; // Default name

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        isVerified: true
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    },
  });

  console.log(`User ${user.email} restored/created with ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
