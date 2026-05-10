const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating all zero-stock products to 25...");
  const result = await prisma.product.updateMany({
    where: { stock: 0 },
    data: { stock: 25 },
  });
  console.log(`Successfully updated ${result.count} products to have 25 in stock.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
