const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting deletion process...");

    // 1. Delete regular invoices and their items
    const deletedInvoiceItems = await prisma.invoiceItem.deleteMany({});
    console.log(`Deleted ${deletedInvoiceItems.count} invoice items.`);
    
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`Deleted ${deletedInvoices.count} invoices.`);

    // 2. Delete trader invoices and their items
    const deletedTraderItems = await prisma.traderInvoiceItem.deleteMany({});
    console.log(`Deleted ${deletedTraderItems.count} trader invoice items.`);
    
    const deletedTraderInvoices = await prisma.traderInvoice.deleteMany({});
    console.log(`Deleted ${deletedTraderInvoices.count} trader invoices.`);

    // 3. Delete traders
    const deletedTraders = await prisma.trader.deleteMany({});
    console.log(`Deleted ${deletedTraders.count} traders.`);

    // Optional: reset customer points/balances if needed, but not requested.

    console.log("Deletion completed successfully!");
  } catch (error) {
    console.error("Error during deletion:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
