
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findFirst();
  console.log('PRODUCT_ID:', p?.id);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
