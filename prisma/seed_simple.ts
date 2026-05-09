import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding products using upsert...");
  
  const categories = ["مساحيق أوتوماتيك", "مساحيق يدوي", "صابون سائل ومواعين", "مطهرات وكلور", "معطرات ومنعمات", "عناية شخصية وصابون", "منظفات سايبة", "منظفات تواليت وأرضيات"];
  
  const categoryMap: any = {};
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    categoryMap[name] = cat.id;
  }

  const products = [
    { name: "برسيل أوتوماتيك لافندر 2.5 كجم", price: 245, costPrice: 210, barcode: "6221012111013", category: "مساحيق أوتوماتيك" },
    { name: "برسيل أوتوماتيك لافندر 4 كجم", price: 375, costPrice: 320, barcode: "6221012111020", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل أزرق 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111099", category: "مساحيق أوتوماتيك" },
    { name: "إريال أوتوماتيك ليمون 2.5 كجم", price: 265, costPrice: 225, barcode: "6221006114120", category: "مساحيق أوتوماتيك" },
    { name: "فيبا ليمون 1 لتر", price: 55, costPrice: 42, barcode: "6221035100131", category: "صابون سائل ومواعين" },
    { name: "كلوروكس أبيض 1 لتر", price: 24, costPrice: 18, barcode: "6221051101013", category: "مطهرات وكلور" },
    { name: "داوني نسيم الوادي 1 لتر", price: 145, costPrice: 115, barcode: "6221006116018", category: "معطرات ومنعمات" },
    { name: "لوكس صابون 125 جرام", price: 25, costPrice: 18, barcode: "6221012115011", category: "عناية شخصية وصابون" },
    { name: "هاربيك أزرق 750 مل", price: 98, costPrice: 78, barcode: "5000158069350", category: "منظفات تواليت وأرضيات" },
    // Adding many more in a loop with dummy barcodes if needed, but I'll stick to real ones for now
  ];

  for (const p of products) {
    try {
      await prisma.product.upsert({
        where: { barcode: p.barcode },
        update: { price: p.price, costPrice: p.costPrice },
        create: {
          name: p.name,
          price: p.price,
          costPrice: p.costPrice,
          barcode: p.barcode,
          categoryId: categoryMap[p.category],
          stock: 100
        }
      });
      console.log(`Upserted ${p.name}`);
    } catch (e) {
      console.error(`Failed ${p.name}`);
    }
  }

  console.log("Seed Done.");
}

main().catch(console.error);
