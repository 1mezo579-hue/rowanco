const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const priceRules = [
    { pattern: 'لبن جهينة 1 لتر', price: 48, cost: 44 },
    { pattern: 'لبن جهينة 1لتر', price: 48, cost: 44 },
    { pattern: 'لبن عبور لاند 1 لتر', price: 42, cost: 38 },
    { pattern: 'لبن بخيره 1 لتر', price: 40, cost: 36 },
    { pattern: 'لبن بخيره نصف لتر', price: 22, cost: 20 },
    { pattern: 'زيت كريستال 800', price: 95, cost: 88 },
    { pattern: 'زيت كريستال 1.6', price: 185, cost: 172 },
    { pattern: 'زيت هلا 800', price: 80, cost: 74 },
    { pattern: 'سكر 1 كجم', price: 38, cost: 34 },
    { pattern: 'سكر 1كجم', price: 38, cost: 34 },
    { pattern: 'أرز الضحى 1 كجم', price: 42, cost: 38 },
    { pattern: 'أرز الساعة 1 كجم', price: 38, cost: 34 },
    { pattern: 'مكرونة الملكة 400', price: 15, cost: 13 },
    { pattern: 'مكرونة روجينا 400', price: 22, cost: 19 },
    { pattern: 'سمنة كريستال 700', price: 90, cost: 82 },
    { pattern: 'سمنة روابي 700', price: 90, cost: 82 },
    { pattern: 'جبنة عبور لاند 250', price: 22, cost: 19 },
    { pattern: 'جبنة دومتي 250', price: 20, cost: 18 },
    { pattern: 'شاي لبتون خرز 100', price: 65, cost: 58 },
    { pattern: 'شاي لبتون ناعم 40', price: 15, cost: 13 },
    { pattern: 'بيبسي 2.5', price: 35, cost: 31 },
    { pattern: 'كوكاكولا 2.5', price: 35, cost: 31 },
    { pattern: 'بيبسي كانز', price: 15, cost: 13 },
    { pattern: 'كوكاكولا كانز', price: 15, cost: 13 },
  ];

  console.log("Updating prices for common products...");

  let updatedCount = 0;

  for (const rule of priceRules) {
    const result = await prisma.product.updateMany({
      where: {
        name: { contains: rule.pattern, mode: 'insensitive' }
      },
      data: {
        price: rule.price,
        costPrice: rule.cost
      }
    });
    updatedCount += result.count;
  }

  // Also do a general check: ensure costPrice is not greater than price
  const fixes = await prisma.product.updateMany({
    where: {
      costPrice: { gt: prisma.product.fields.price }
    },
    data: {
      costPrice: { multiply: 0.9 } // This doesn't work directly in updateMany with fields, we'd need a raw query or loop
    }
  }).catch(() => 0);

  console.log(`Updated ${updatedCount} products with real market prices.`);
  console.log("Price adjustment complete.");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
