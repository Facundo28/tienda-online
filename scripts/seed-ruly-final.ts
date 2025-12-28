
// Load env vars first
require('dotenv').config();

import { PrismaClient, UserRole } from '../src/generated/prisma';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ruly S.A. Logistics (Robust Mode)...');

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

  console.log('👤 Ruly User Created:', ruly.id);

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

  console.log('🏢 Company Ruly S.A. Created:', company.id);

  // 3. Create a Worker for Ruly
  const workerEmail = 'chofer@ruly.com';
  const workerPassword = await hash('123456', 12);

  const worker = await prisma.user.upsert({
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

  console.log('🚚 Worker Pepe Created:', worker.id);
  console.log('✅ Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
