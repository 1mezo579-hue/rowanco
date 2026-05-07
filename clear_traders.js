const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all trader invoices...");
  await prisma.traderInvoice.deleteMany({});
  
  console.log("Deleting all traders...");
  await prisma.trader.deleteMany({});
  
  console.log("All traders have been completely removed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
