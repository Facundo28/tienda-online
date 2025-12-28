
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'ruly@logistica.com' }
  });
  console.log('Ruly User:', user);
  
  const company = await prisma.logisticsCompany.findUnique({
      where: { ownerId: user ? user.id : "non_existent" }
  });
  console.log('Ruly Company:', company);
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
