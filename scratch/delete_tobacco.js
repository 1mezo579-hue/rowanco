const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tobaccoKeywords = [
    'سجائر', 'تدخين', 'معسل', 'تبغ', 'ولاعة', 'كبريت',
    'Cigarettes', 'Tobacco', 'Marlboro', 'Merit', 'L&M', 'Winston', 
    'Cleopatra', 'Rothmans', 'Karelia', 'Camel', 'Pall Mall', 
    'Lucky Strike', 'Dunhill', 'Davidoff', 'Heets', 'Terea', 'LM',
    'مارلبورو', 'ميريت', 'وينستون', 'كليوباترا', 'روثمانز', 'كارليا', 
    'كامل', 'بال مال', 'لاكي سترايك', 'دنهيل', 'دافيدوف', 'هيتس', 'تيريا', 'ال ام'
  ];

  console.log("Searching for tobacco products...");
  
  const productsToDelete = await prisma.product.findMany({
    where: {
      OR: tobaccoKeywords.map(keyword => ({
        name: { contains: keyword, mode: 'insensitive' }
      }))
    }
  });

  console.log(`Found ${productsToDelete.length} products to delete.`);
  
  if (productsToDelete.length > 0) {
    // Delete related records first if necessary, but TraderInvoiceItem has productId nullable and onDelete: Cascade usually handles it if set.
    // However, TraderInvoiceItem and InvoiceItem might need careful handling.
    // In schema.prisma, InvoiceItem has onDelete: Cascade. 
    // TraderInvoiceItem has onDelete: Cascade for traderInvoice, but for product it's optional.
    
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: { in: productsToDelete.map(p => p.id) }
      }
    });
    console.log(`Deleted ${deleteResult.count} products.`);
  }

  // Also delete categories that might be named "Tobacco" or "Smoking"
  const categoriesToDelete = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: 'سجائر', mode: 'insensitive' } },
        { name: { contains: 'تدخين', mode: 'insensitive' } },
        { name: { contains: 'Tobacco', mode: 'insensitive' } },
        { name: { contains: 'Smoking', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${categoriesToDelete.length} categories to delete.`);
  for (const cat of categoriesToDelete) {
    await prisma.category.delete({ where: { id: cat.id } }).catch(e => console.log(`Could not delete category ${cat.name}: ${e.message}`));
  }

  console.log("Tobacco cleanup complete.");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
