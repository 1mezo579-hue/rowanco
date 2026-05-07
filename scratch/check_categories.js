const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } }
  });
  console.log(JSON.stringify(categories, null, 2));
}

run().finally(() => prisma.$disconnect());
