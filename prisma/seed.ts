import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Rowanco for Detergents (Master Sync Mode)...");

  // Upsert Admin User (don't delete users to avoid logout)
  const hashedPassword = await bcrypt.hash("102030", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { name: "المالك (إسلام)" },
    create: { username: "admin", password: hashedPassword, role: "admin", name: "المالك (إسلام)" },
  });

  const categories = [
    "مساحيق أوتوماتيك", "مساحيق يدوي", "صابون سائل ومواعين", 
    "مطهرات وكلور", "معطرات ومنعمات", "عناية شخصية وصابون", 
    "منظفات سايبة", "منظفات تواليت وأرضيات"
  ];

  const categoryMap: any = {};
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    categoryMap[name] = cat.id;
  }

  const productsData = [
    // --- مساحيق أوتوماتيك ---
    { name: "برسيل أوتوماتيك لافندر 2.5 كجم", price: 245, costPrice: 210, barcode: "6221012111013", category: "مساحيق أوتوماتيك" },
    { name: "برسيل أوتوماتيك لافندر 4 كجم", price: 375, costPrice: 320, barcode: "6221012111020", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل أزرق 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111099", category: "مساحيق أوتوماتيك" },
    { name: "إريال أوتوماتيك ليمون 2.5 كجم", price: 265, costPrice: 225, barcode: "6221006114120", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي أوتوماتيك لافندر 4 كجم", price: 345, costPrice: 295, barcode: "6221035102043", category: "مساحيق أوتوماتيك" },
    
    // --- صابون سائل ومواعين ---
    { name: "فيبا ليمون 1 لتر", price: 55, costPrice: 42, barcode: "6221035100131", category: "صابون سائل ومواعين" },
    { name: "بريل ليمون 1 لتر", price: 58, costPrice: 48, barcode: "6221012301018", category: "صابون سائل ومواعين" },
    
    // --- مطهرات وكلور ---
    { name: "كلوروكس أبيض 1 لتر", price: 24, costPrice: 18, barcode: "6221051101013", category: "مطهرات وكلور" },
    { name: "ديتول مطهر 500 مل", price: 185, costPrice: 155, barcode: "5000158066113", category: "مطهرات وكلور" },
    
    // --- منظفات سايبة (PriceType: weight) ---
    { name: "برسيل سايب أوتوماتيك (كيلو)", price: 65, costPrice: 52, barcode: "SAIB-PERSIL-AUTO", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "إريال سايب أوتوماتيك (كيلو)", price: 68, costPrice: 55, barcode: "SAIB-ARIEL-AUTO", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "صابون سائل سايب ممتاز (كيلو)", price: 12, costPrice: 8, barcode: "SAIB-SOAP-LUX", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "كلور سايب أبيض (كيلو)", price: 5, costPrice: 2, barcode: "SAIB-CLOR-WHITE", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: { price: p.price, costPrice: p.costPrice },
      create: {
        name: p.name,
        price: p.price,
        costPrice: p.costPrice,
        barcode: p.barcode,
        priceType: p.priceType || "unit",
        unit: p.unit || "قطعة",
        categoryId: categoryMap[p.category],
        stock: 100,
        minStock: 10,
      }
    });
  }

  console.log("Seeding Completed! Data is now synced for both Local and Cloud.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });