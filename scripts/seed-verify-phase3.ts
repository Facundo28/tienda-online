
import { PrismaClient, DeliveryMethod, DeliveryStatus, UserRole } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding verification data...');

  // 1. Ensure Admin User
  const adminEmail = 'admin@test.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin Test',
        passwordHash: 'irrelevant', // simplified
        role: UserRole.ADMIN,
      },
    });
    console.log('Created Admin:', admin.id);
  } else {
    // Ensure role is admin
    await prisma.user.update({ where: { id: admin.id }, data: { role: UserRole.ADMIN } });
    console.log('Found Admin:', admin.id);
  }

  // 2. Create Product (if not exists)
  let product = await prisma.product.findFirst();
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: 'Producto Pruebas',
        description: 'Descripcion de prueba',
        priceCents: 10000,
        imageUrl: '/placeholder.jpg',
      },
    });
  }
  console.log('Using Product:', product.id);

  // 3. Create PICKUP Order with known code
  const code = 'TEST1234';
  // Delete existing order with this code to avoid conflict
  await prisma.order.deleteMany({ where: { pickupCode: code } });

  const order = await prisma.order.create({
    data: {
      customerName: 'Cliente Test',
      customerEmail: 'cliente@test.com',
      addressLine1: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      postalCode: '1234',
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
  });

  console.log(`Created Order ${order.id} with Code ${code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
