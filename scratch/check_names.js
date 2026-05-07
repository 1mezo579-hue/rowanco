const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'لبن' } },
        { name: { contains: 'زيت' } },
        { name: { contains: 'سكر' } },
        { name: { contains: 'أرز' } },
        { name: { contains: 'مكرونة' } }
      ]
    },
    take: 20
  });
  console.log(JSON.stringify(products, null, 2));
}

run().finally(() => prisma.$disconnect());
