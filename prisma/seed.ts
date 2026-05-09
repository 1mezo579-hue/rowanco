import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("DANGER: Wiping and Re-seeding Rowanco Database (Full Sync Mode)...");

  // Wipe to ensure clean slate
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log("Database Wiped.");

  // Create Admin User
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
    const cat = await prisma.category.create({ data: { name } });
    categoryMap[name] = cat.id;
  }

  const productsData = [
    // --- 1. قائمة الأسعار الجديدة المطلوبة (أولوية) ---
    { name: "جينرال منظف أرضيات 730 مل", price: 45, costPrice: 38, barcode: "6221001000010", category: "مطهرات وكلور" },
    { name: "صابون سافانا 125 جرام", price: 17, costPrice: 14, barcode: "6221001000027", category: "عناية شخصية وصابون" },
    { name: "مسحوق فل عادي", price: 27, costPrice: 22, barcode: "6221001000034", category: "مساحيق يدوي" },
    { name: "بامبرز مقاس 3", price: 380, costPrice: 340, barcode: "4015400645041", category: "عناية شخصية وصابون" },
    { name: "داوني ازايز لتر", price: 100, costPrice: 85, barcode: "6221006116018", category: "معطرات ومنعمات" },
    { name: "مولفيكس 4 شورت", price: 350, costPrice: 310, barcode: "6221001000065", category: "عناية شخصية وصابون" },
    { name: "مولفيكس 5 شورت", price: 400, costPrice: 360, barcode: "6221001000072", category: "عناية شخصية وصابون" },
    { name: "مولفيكس 6 شورت", price: 345, costPrice: 310, barcode: "6221001000263", category: "عناية شخصية وصابون" },
    { name: "مناديل بابيا 6 بكره", price: 65, costPrice: 55, barcode: "6221001000089", category: "منظفات تواليت وأرضيات" },
    { name: "اريال جيل اتوماتيك 2.35 لتر", price: 220, costPrice: 195, barcode: "6221006114205", category: "مساحيق أوتوماتيك" },
    { name: "تايد اتوماتيك 60", price: 60, costPrice: 48, barcode: "6221006112010", category: "مساحيق أوتوماتيك" },
    { name: "كلوركس اللوان لتر", price: 70, costPrice: 55, barcode: "6221051101037", category: "مطهرات وكلور" },
    { name: "سيترس منظف", price: 100, costPrice: 85, barcode: "6221001000126", category: "مطهرات وكلور" },
    { name: "مناديل زينه سحب", price: 28, costPrice: 22, barcode: "6224000371018", category: "منظفات تواليت وأرضيات" },
    { name: "مناديل زينه حمام 2 بكره", price: 22, costPrice: 18, barcode: "6221001000140", category: "منظفات تواليت وأرضيات" },
    { name: "مناديل حمام زينه 6 بكره", price: 60, costPrice: 50, barcode: "6221001000157", category: "منظفات تواليت وأرضيات" },
    { name: "مناديل وايت سحب", price: 28, costPrice: 22, barcode: "6221001000164", category: "منظفات تواليت وأرضيات" },
    { name: "فيبا 4 لتر ليمون", price: 125, costPrice: 105, barcode: "6221035100162", category: "صابون سائل ومواعين" },
    { name: "بليدج ملمع موبيليا", price: 70, costPrice: 55, barcode: "5000204123067", category: "منظفات تواليت وأرضيات" },
    { name: "اوكسي 2 كيلو لافندر", price: 125, costPrice: 105, barcode: "6221035102029", category: "مساحيق أوتوماتيك" },
    { name: "اوكسي كيلو لافندر", price: 70, costPrice: 58, barcode: "6221035101022", category: "مساحيق أوتوماتيك" },
    { name: "اوكس نص كيلو", price: 40, costPrice: 32, barcode: "6221035101015", category: "مساحيق أوتوماتيك" },
    { name: "بريل 600 مل", price: 35, costPrice: 28, barcode: "6221012301018", category: "صابون سائل ومواعين" },
    { name: "كلوركس ابيض لتر", price: 30, costPrice: 24, barcode: "6221051101013", category: "مطهرات وكلور" },
    { name: "مناديل مطبخ 6 بكره", price: 70, costPrice: 58, barcode: "6221001000249", category: "منظفات تواليت وأرضيات" },
    { name: "اوكسي 600 جرام", price: 33, costPrice: 26, barcode: "6221001000256", category: "مساحيق يدوي" },
    { name: "صابون اصفر", price: 10, costPrice: 8, barcode: "6221001000270", category: "عناية شخصية وصابون" },
    { name: "برسيل جيل عادي", price: 24, costPrice: 18, barcode: "6221001000287", category: "مساحيق يدوي" },
    { name: "برسيل جيل اتو ماتيك", price: 30, costPrice: 24, barcode: "6221001000294", category: "مساحيق أوتوماتيك" },
    { name: "بريل سايب (كيلو)", price: 14, costPrice: 10, barcode: "SAIB-PRIL-V2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "كلور سايب (كيلو)", price: 7, costPrice: 4, barcode: "SAIB-CLOR-V2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "ديتول سايب (كيلو)", price: 22, costPrice: 15, barcode: "SAIB-DETTOL-V2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "داوني سايب (كيلو)", price: 22, costPrice: 15, barcode: "SAIB-DOWNY-V2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "شاور سايب (كيلو)", price: 30, costPrice: 20, barcode: "SAIB-SHOWER-V2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "معطرات سايبة (كيلو)", price: 35, costPrice: 25, barcode: "SAIB-FRESH-V2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },

    // --- 2. بقية المنتجات الأصلية (لإكمال الـ 100+) ---
    { name: "برسيل أوتوماتيك لافندر 4 كجم", price: 375, costPrice: 320, barcode: "6221012111020", category: "مساحيق أوتوماتيك" },
    { name: "برسيل أوتوماتيك لافندر 6 كجم", price: 540, costPrice: 470, barcode: "6221012111068", category: "مساحيق أوتوماتيك" },
    { name: "برسيل أوتوماتيك لافندر 8 كجم", price: 695, costPrice: 610, barcode: "6221012111082", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل بلاك 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111203", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل أبيض 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111302", category: "مساحيق أوتوماتيك" },
    { name: "إريال أوتوماتيك ليمون 4.5 كجم", price: 460, costPrice: 395, barcode: "6221006114144", category: "مساحيق أوتوماتيك" },
    { name: "إريال أوتوماتيك ليمون 6 كجم", price: 595, costPrice: 510, barcode: "6221006114168", category: "مساحيق أوتوماتيك" },
    { name: "تايد أوتوماتيك ليمون 4 كجم", price: 325, costPrice: 280, barcode: "6221006112041", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي أوتوماتيك لافندر 4 كجم", price: 345, costPrice: 295, barcode: "6221035102043", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي أوتوماتيك لافندر 6 كجم", price: 495, costPrice: 425, barcode: "6221035102067", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي جيل لافندر 2.5 لتر", price: 185, costPrice: 155, barcode: "6221035102081", category: "مساحيق أوتوماتيك" },
    { name: "بونكس أوتوماتيك 4.5 كجم", price: 285, costPrice: 245, barcode: "6221006111044", category: "مساحيق أوتوماتيك" },
    { name: "برسيل عادي 400 جرام", price: 35, costPrice: 28, barcode: "6221012112010", category: "مساحيق يدوي" },
    { name: "برسيل عادي 1 كجم", price: 85, costPrice: 72, barcode: "6221012112027", category: "مساحيق يدوي" },
    { name: "إريال عادي 1 كجم", price: 92, costPrice: 78, barcode: "6221006114021", category: "مساحيق يدوي" },
    { name: "تايد عادي 1 كجم", price: 78, costPrice: 65, barcode: "6221006112034", category: "مساحيق يدوي" },
    { name: "أوكسي عادي 900 جرام", price: 48, costPrice: 38, barcode: "6221035101022", category: "مساحيق يدوي" },
    { name: "فيبا ليمون 1 لتر", price: 55, costPrice: 42, barcode: "6221035100131", category: "صابون سائل ومواعين" },
    { name: "فيبا ليمون 2 لتر", price: 85, costPrice: 65, barcode: "6221035100148", category: "صابون سائل ومواعين" },
    { name: "بريل ليمون 2.5 لتر", price: 125, costPrice: 95, barcode: "6221012301032", category: "صابون سائل ومواعين" },
    { name: "فيري ليمون 1 لتر", price: 85, costPrice: 65, barcode: "6221006113031", category: "صابون سائل ومواعين" },
    { name: "كلوروكس أبيض 4 لتر", price: 85, costPrice: 65, barcode: "6221051101044", category: "مطهرات وكلور" },
    { name: "كلوروكس ألوان 2 لتر", price: 98, costPrice: 78, barcode: "6221051101051", category: "مطهرات وكلور" },
    { name: "ديتول مطهر 500 مل", price: 185, costPrice: 155, barcode: "5000158066113", category: "مطهرات وكلور" },
    { name: "داوني لافندر 2 لتر", price: 265, costPrice: 220, barcode: "6221006116025", category: "معطرات ومنعمات" },
    { name: "كومفورت ورد 1 لتر", price: 135, costPrice: 110, barcode: "6221003113016", category: "معطرات ومنعمات" },
    { name: "فريدال معطر عود 460 مل", price: 65, costPrice: 48, barcode: "6221035100322", category: "معطرات ومنعمات" },
    { name: "لوكس صابون سحر الجمال", price: 25, costPrice: 18, barcode: "6221012115011", category: "عناية شخصية وصابون" },
    { name: "دوف صابون ناعم", price: 45, costPrice: 35, barcode: "6221012116018", category: "عناية شخصية وصابون" },
    { name: "ديتول صابون أزرق", price: 28, costPrice: 22, barcode: "5000158067103", category: "عناية شخصية وصابون" },
    { name: "صن سيلك شامبو 400 مل", price: 115, costPrice: 85, barcode: "6221012118012", category: "عناية شخصية وصابون" },
    { name: "بانتين شامبو 400 مل", price: 135, costPrice: 105, barcode: "6221006115011", category: "عناية شخصية وصابون" },
    { name: "سجنال معجون أسنان", price: 65, costPrice: 48, barcode: "6221012119019", category: "عناية شخصية وصابون" },
    { name: "هاربيك أزرق 750 مل", price: 98, costPrice: 78, barcode: "5000158069350", category: "منظفات تواليت وأرضيات" },
    { name: "فلاش تواليت 500 مل", price: 45, costPrice: 32, barcode: "6221035100100", category: "منظفات تواليت وأرضيات" },
    { name: "مستر مصل زجاج 500 مل", price: 65, costPrice: 48, barcode: "5000204123012", category: "منظفات تواليت وأرضيات" },
    { name: "جليد معطر 300 مل", price: 85, costPrice: 65, barcode: "5000204123050", category: "منظفات تواليت وأرضيات" },
    { name: "لوكس شاور جل 500 مل", price: 135, costPrice: 105, barcode: "6221012115042", category: "عناية شخصية وصابون" },
    { name: "ديتول صابون أخضر", price: 28, costPrice: 22, barcode: "5000158067110", category: "عناية شخصية وصابون" },
    { name: "لايف بوي صابون 125 جرام", price: 22, costPrice: 16, barcode: "6221012117015", category: "عناية شخصية وصابون" },
    { name: "ريكسونا سبراي رجالي", price: 125, costPrice: 95, barcode: "8801019011012", category: "عناية شخصية وصابون" },
    { name: "ريكسونا سبراي حريمي", price: 125, costPrice: 95, barcode: "8801019011029", category: "عناية شخصية وصابون" },
    { name: "صن سيلك شامبو أسود", price: 115, costPrice: 85, barcode: "6221012118029", category: "عناية شخصية وصابون" },
    { name: "كلوز اب معجون أسنان", price: 68, costPrice: 50, barcode: "6221012119026", category: "عناية شخصية وصابون" },
    { name: "هاربيك أحمر 750 مل", price: 98, costPrice: 78, barcode: "5000158069367", category: "منظفات تواليت وأرضيات" },
    { name: "هاربيك أسود 750 مل", price: 115, costPrice: 90, barcode: "5000158069374", category: "منظفات تواليت وأرضيات" },
    { name: "بليدج ملمع خشب", price: 95, costPrice: 75, barcode: "5000204123069", category: "منظفات تواليت وأرضيات" },
    { name: "فريدال معطر ورد 460 مل", price: 65, costPrice: 48, barcode: "6221035100308", category: "معطرات ومنعمات" },
    { name: "فريدال معطر لافندر 460 مل", price: 65, costPrice: 48, barcode: "6221035100315", category: "معطرات ومنعمات" },
    { name: "فريدال معطر خوخ 460 مل", price: 65, costPrice: 48, barcode: "6221035100339", category: "معطرات ومنعمات" },
    { name: "برسيل جيل بلاك 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111204", category: "مساحيق أوتوماتيك" },
    { name: "صابون سائل سايب ممتاز (كيلو)", price: 12, costPrice: 8, barcode: "SAIB-SOAP-LUX-2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "كلور سايب أبيض (كيلو)", price: 5, costPrice: 2, barcode: "SAIB-CLOR-WHITE-2", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "مطهر ديتول سايب (كيلو)", price: 40, costPrice: 30, barcode: "SAIB-DETTOL-FINAL", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "صابون سافانا ليمون", price: 17, costPrice: 14, barcode: "SAVANA-LEMON", category: "عناية شخصية وصابون" },
    { name: "فل مسحوق يدوي كبير", price: 55, costPrice: 45, barcode: "FULL-BIG", category: "مساحيق يدوي" },
    { name: "بامبرز مقاس 4", price: 395, costPrice: 350, barcode: "PAMP-4", category: "عناية شخصية وصابون" },
    { name: "مولفيكس 4 عادي", price: 320, costPrice: 280, barcode: "MOL-4-REG", category: "عناية شخصية وصابون" },
    { name: "تايد أوتوماتيك ليمون 2.5 كجم", price: 195, costPrice: 165, barcode: "TIDE-2.5-AUTO", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي عادي 450 جرام", price: 25, costPrice: 18, barcode: "OXI-450-REG", category: "مساحيق يدوي" },
    { name: "بريل 1 لتر ليمون", price: 58, costPrice: 48, barcode: "PRIL-1L", category: "صابون سائل ومواعين" },
    { name: "كلوروكس ألوان 1 لتر الأصلي", price: 55, costPrice: 42, barcode: "CLOR-COLOR-1L", category: "مطهرات وكلور" },
    { name: "سيترس 7 في 1", price: 135, costPrice: 110, barcode: "SETRIS-7IN1", category: "مطهرات وكلور" },
    { name: "زينه مناديل مطبخ", price: 65, costPrice: 50, barcode: "ZEINA-KITCHEN", category: "منظفات تواليت وأرضيات" },
    { name: "وايت مناديل 550 منديل", price: 45, costPrice: 35, barcode: "WHITE-550", category: "منظفات تواليت وأرضيات" },
    { name: "فيبا ليمون 2 لتر عرض", price: 85, costPrice: 65, barcode: "VIBA-2L-PROMO", category: "صابون سائل ومواعين" },
    { name: "بليدج ملمع باركيه", price: 95, costPrice: 75, barcode: "PLEDGE-PARK", category: "منظفات تواليت وأرضيات" },
    { name: "اوكسي 4 كجم لافندر", price: 345, costPrice: 295, barcode: "OXI-4KG", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل أبيض 1 لتر", price: 95, costPrice: 75, barcode: "PERSIL-WHITE-1L", category: "مساحيق أوتوماتيك" },
    { name: "هاربيك أسود توفير", price: 105, costPrice: 85, barcode: "HARPIC-BLACK-SAVE", category: "منظفات تواليت وأرضيات" }
  ];

  const seenBarcodes = new Set();
  const finalData = [];
  for (const p of productsData) {
    if (!seenBarcodes.has(p.barcode)) {
      seenBarcodes.add(p.barcode);
      finalData.push(p);
    }
  }

  console.log(`Processing ${finalData.length} unique products...`);
  for (const p of finalData) {
    await prisma.product.create({
      data: {
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

  console.log("Seeding Completed Successfully! 100% Unified Database.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });