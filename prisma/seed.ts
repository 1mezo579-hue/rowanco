import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database for real barcode update...");
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const hashedPassword = await bcrypt.hash("102030", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { name: "المالك (Owner)" },
    create: { username: "admin", password: hashedPassword, role: "admin", name: "المالك (Owner)" },
  });

  const categories = [
    {
      name: "منظفات سايبة (بالوزن)",
      products: [
        { name: "برسيل سايب لافندر (كجم)", costPrice: 48, price: 58, priceType: "weight", barcode: "RAW-001" },
        { name: "برسيل سايب أزرق (كجم)", costPrice: 46, price: 56, priceType: "weight", barcode: "RAW-002" },
        { name: "إريال سايب أصلي (كجم)", costPrice: 52, price: 62, priceType: "weight", barcode: "RAW-003" },
        { name: "أوكسي سايب لافندر (كجم)", costPrice: 42, price: 52, priceType: "weight", barcode: "RAW-004" },
        { name: "كلور سايب شفاف (لتر)", costPrice: 4, price: 7, priceType: "weight", barcode: "RAW-005" },
        { name: "صابون سائل فيبا سايب (لتر)", costPrice: 12, price: 18, priceType: "weight", barcode: "RAW-006" },
        { name: "داوني سايب ورد (كجم)", costPrice: 15, price: 25, priceType: "weight", barcode: "RAW-007" },
      ]
    },
    {
      name: "مساحيق أوتوماتيك (ماركات)",
      products: [
        { name: "برسيل أوتوماتيك لافندر 2.5 كجم", costPrice: 205, price: 245, barcode: "6221012111013" },
        { name: "برسيل أوتوماتيك أزرق 4 كجم", costPrice: 310, price: 365, barcode: "6221012111020" },
        { name: "برسيل أوتوماتيك لافندر 6 كجم", costPrice: 450, price: 520, barcode: "6221012111068" },
        { name: "إريال أوتوماتيك ليمون 2.5 كجم", costPrice: 220, price: 265, barcode: "6221006114120" },
        { name: "إريال أوتوماتيك ليمون 4.5 كجم", costPrice: 390, price: 445, barcode: "6221006114144" },
        { name: "تايد أوتوماتيك ليمون 2.5 كجم", costPrice: 160, price: 195, barcode: "6221006112027" },
        { name: "أوكسي أوتوماتيك لافندر 2 كجم", costPrice: 140, price: 175, barcode: "6221035102029" },
        { name: "برسيل جيل أزرق 2.5 لتر", costPrice: 175, price: 215, barcode: "6221012111082" },
      ]
    },
    {
      name: "منظفات أطباق (ماركات)",
      products: [
        { name: "فيبا ليمون 2 لتر", costPrice: 65, price: 85, barcode: "6221035100148" },
        { name: "فيبا ليمون 4 لتر", costPrice: 115, price: 145, barcode: "6221035100162" },
        { name: "بريل ليمون 1 لتر", costPrice: 48, price: 58, barcode: "6221012301018" },
        { name: "فيري ليمون 1 لتر", costPrice: 65, price: 85, barcode: "6221006113017" },
      ]
    },
    {
      name: "مطهرات ومعقمات",
      products: [
        { name: "ديتول مطهر 500 مل", costPrice: 155, price: 185, barcode: "5000158066113" },
        { name: "كلوروكس أبيض 1 لتر", costPrice: 18, price: 24, barcode: "6221051101013" },
        { name: "كلوروكس ألوان 1 لتر", costPrice: 42, price: 55, barcode: "6221051101037" },
        { name: "هاربيك أزرق 750 مل", costPrice: 78, price: 98, barcode: "5000158069350" },
      ]
    },
    {
      name: "مناديل وورقيات",
      products: [
        { name: "فاين مناديل سحب 550 (3 عبوات)", costPrice: 95, price: 125, barcode: "6221003112019" },
        { name: "زينة مناديل سحب 550 (3 عبوات)", costPrice: 88, price: 115, barcode: "6221003112040" },
        { name: "بابيا مناديل سحب 550 (3 عبوات)", costPrice: 105, price: 135, barcode: "6221003112064" },
      ]
    }
  ];

  for (const cData of categories) {
    const category = await prisma.category.create({ data: { name: cData.name } });
    for (const pData of cData.products) {
      await prisma.product.create({
        data: {
          ...pData,
          barcode: pData.barcode || `622${Date.now()}${Math.floor(Math.random() * 1000)}`.substring(0, 13),
          categoryId: category.id,
          stock: 100,
        }
      });
    }
  }

  console.log("Seeding Database Completed with real barcodes!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });