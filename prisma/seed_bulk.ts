import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning old data and seeding 100+ real detergent products...");

  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.stockLog.deleteMany({});
  await prisma.traderInvoiceItem.deleteMany({});
  await prisma.traderInvoice.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const categories = [
    { name: "مساحيق أوتوماتيك" },
    { name: "مساحيق يدوي" },
    { name: "صابون سائل ومواعين" },
    { name: "مطهرات وكلور" },
    { name: "معطرات ومنعمات" },
    { name: "عناية شخصية وصابون" },
    { name: "منظفات سايبة" },
    { name: "منظفات تواليت وأرضيات" }
  ];

  const createdCategories: any = {};
  for (const cat of categories) {
    createdCategories[cat.name] = await prisma.category.create({ data: cat });
  }

  const productsData = [
    // --- مساحيق أوتوماتيك ---
    { name: "برسيل أوتوماتيك لافندر 2.5 كجم", price: 245, costPrice: 210, barcode: "6221012111013", category: "مساحيق أوتوماتيك" },
    { name: "برسيل أوتوماتيك لافندر 4 كجم", price: 375, costPrice: 320, barcode: "6221012111020", category: "مساحيق أوتوماتيك" },
    { name: "برسيل أوتوماتيك لافندر 6 كجم", price: 540, costPrice: 470, barcode: "6221012111068", category: "مساحيق أوتوماتيك" },
    { name: "برسيل أوتوماتيك لافندر 8 كجم", price: 695, costPrice: 610, barcode: "6221012111082", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل أزرق 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111099", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل بلاك 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111203", category: "مساحيق أوتوماتيك" },
    { name: "برسيل جيل أبيض 2.5 لتر", price: 215, costPrice: 185, barcode: "6221012111302", category: "مساحيق أوتوماتيك" },
    { name: "إريال أوتوماتيك ليمون 2.5 كجم", price: 265, costPrice: 225, barcode: "6221006114120", category: "مساحيق أوتوماتيك" },
    { name: "إريال أوتوماتيك ليمون 4.5 كجم", price: 460, costPrice: 395, barcode: "6221006114144", category: "مساحيق أوتوماتيك" },
    { name: "إريال أوتوماتيك ليمون 6 كجم", price: 595, costPrice: 510, barcode: "6221006114168", category: "مساحيق أوتوماتيك" },
    { name: "إريال جيل لافندر 2.5 لتر", price: 225, costPrice: 195, barcode: "6221006114205", category: "مساحيق أوتوماتيك" },
    { name: "تايد أوتوماتيك ليمون 2.5 كجم", price: 195, costPrice: 165, barcode: "6221006112027", category: "مساحيق أوتوماتيك" },
    { name: "تايد أوتوماتيك ليمون 4 كجم", price: 325, costPrice: 280, barcode: "6221006112041", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي أوتوماتيك لافندر 2 كجم", price: 175, costPrice: 145, barcode: "6221035102029", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي أوتوماتيك لافندر 4 كجم", price: 345, costPrice: 295, barcode: "6221035102043", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي أوتوماتيك لافندر 6 كجم", price: 495, costPrice: 425, barcode: "6221035102067", category: "مساحيق أوتوماتيك" },
    { name: "أوكسي جيل لافندر 2.5 لتر", price: 185, costPrice: 155, barcode: "6221035102081", category: "مساحيق أوتوماتيك" },
    { name: "بونكس أوتوماتيك 2.5 كجم", price: 165, costPrice: 135, barcode: "6221006111020", category: "مساحيق أوتوماتيك" },
    { name: "بونكس أوتوماتيك 4.5 كجم", price: 285, costPrice: 245, barcode: "6221006111044", category: "مساحيق أوتوماتيك" },

    // --- مساحيق يدوي ---
    { name: "برسيل عادي 400 جرام", price: 35, costPrice: 28, barcode: "6221012112010", category: "مساحيق يدوي" },
    { name: "برسيل عادي 1 كجم", price: 85, costPrice: 72, barcode: "6221012112027", category: "مساحيق يدوي" },
    { name: "إريال عادي 400 جرام", price: 38, costPrice: 30, barcode: "6221006114014", category: "مساحيق يدوي" },
    { name: "إريال عادي 1 كجم", price: 92, costPrice: 78, barcode: "6221006114021", category: "مساحيق يدوي" },
    { name: "تايد عادي 400 جرام", price: 32, costPrice: 25, barcode: "6221006112010", category: "مساحيق يدوي" },
    { name: "تايد عادي 1 كجم", price: 78, costPrice: 65, barcode: "6221006112034", category: "مساحيق يدوي" },
    { name: "أوكسي عادي 450 جرام", price: 25, costPrice: 18, barcode: "6221035101015", category: "مساحيق يدوي" },
    { name: "أوكسي عادي 900 جرام", price: 48, costPrice: 38, barcode: "6221035101022", category: "مساحيق يدوي" },
    { name: "بونكس عادي 450 جرام", price: 22, costPrice: 16, barcode: "6221006111013", category: "مساحيق يدوي" },

    // --- صابون سائل ومواعين ---
    { name: "فيبا ليمون 600 مل", price: 35, costPrice: 26, barcode: "6221035100124", category: "صابون سائل ومواعين" },
    { name: "فيبا ليمون 1 لتر", price: 55, costPrice: 42, barcode: "6221035100131", category: "صابون سائل ومواعين" },
    { name: "فيبا ليمون 2 لتر", price: 85, costPrice: 65, barcode: "6221035100148", category: "صابون سائل ومواعين" },
    { name: "فيبا ليمون 4 لتر", price: 145, costPrice: 115, barcode: "6221035100162", category: "صابون سائل ومواعين" },
    { name: "فيبا تفاح 1 لتر", price: 55, costPrice: 42, barcode: "6221035100179", category: "صابون سائل ومواعين" },
    { name: "بريل ليمون 1 لتر", price: 58, costPrice: 48, barcode: "6221012301018", category: "صابون سائل ومواعين" },
    { name: "بريل ليمون 2.5 لتر", price: 125, costPrice: 95, barcode: "6221012301032", category: "صابون سائل ومواعين" },
    { name: "فيري ليمون 450 مل", price: 45, costPrice: 35, barcode: "6221006113017", category: "صابون سائل ومواعين" },
    { name: "فيري ليمون 1 لتر", price: 85, costPrice: 65, barcode: "6221006113031", category: "صابون سائل ومواعين" },
    { name: "أوكسي مواعين ليمون 1 لتر", price: 48, costPrice: 38, barcode: "6221035103019", category: "صابون سائل ومواعين" },

    // --- مطهرات وكلور ---
    { name: "كلوروكس أبيض 1 لتر", price: 24, costPrice: 18, barcode: "6221051101013", category: "مطهرات وكلور" },
    { name: "كلوروكس أبيض 4 لتر", price: 85, costPrice: 65, barcode: "6221051101044", category: "مطهرات وكلور" },
    { name: "كلوروكس ألوان 1 لتر", price: 55, costPrice: 42, barcode: "6221051101037", category: "مطهرات وكلور" },
    { name: "كلوروكس ألوان 2 لتر", price: 98, costPrice: 78, barcode: "6221051101051", category: "مطهرات وكلور" },
    { name: "كلوروكس 5 في 1 ليمون 1 لتر", price: 65, costPrice: 48, barcode: "6221051101068", category: "مطهرات وكلور" },
    { name: "ديتول مطهر 250 مل", price: 95, costPrice: 75, barcode: "5000158066106", category: "مطهرات وكلور" },
    { name: "ديتول مطهر 500 مل", price: 185, costPrice: 155, barcode: "5000158066113", category: "مطهرات وكلور" },
    { name: "ديتول مطهر 750 مل", price: 245, costPrice: 210, barcode: "5000158066120", category: "مطهرات وكلور" },
    { name: "ديتول سبراي أسطح 400 مل", price: 165, costPrice: 135, barcode: "5000158066137", category: "مطهرات وكلور" },

    // --- معطرات ومنعمات ---
    { name: "داوني نسيم الوادي 1 لتر", price: 145, costPrice: 115, barcode: "6221006116018", category: "معطرات ومنعمات" },
    { name: "داوني نسيم الوادي 2 لتر", price: 265, costPrice: 220, barcode: "6221006116025", category: "معطرات ومنعمات" },
    { name: "داوني مركز 880 مل", price: 185, costPrice: 155, barcode: "6221006116032", category: "معطرات ومنعمات" },
    { name: "كومفورت ورد 1 لتر", price: 135, costPrice: 110, barcode: "6221003113016", category: "معطرات ومنعمات" },
    { name: "كومفورت أزرق 1 لتر", price: 135, costPrice: 110, barcode: "6221003113023", category: "معطرات ومنعمات" },
    { name: "فريدال معطر جو ورد 460 مل", price: 65, costPrice: 48, barcode: "6221035100308", category: "معطرات ومنعمات" },
    { name: "فريدال معطر جو لافندر 460 مل", price: 65, costPrice: 48, barcode: "6221035100315", category: "معطرات ومنعمات" },
    { name: "فريدال معطر جو عود 460 مل", price: 65, costPrice: 48, barcode: "6221035100322", category: "معطرات ومنعمات" },
    { name: "فريدال معطر جو خوخ 460 مل", price: 65, costPrice: 48, barcode: "6221035100339", category: "معطرات ومنعمات" },

    // --- عناية شخصية وصابون ---
    { name: "لوكس صابون 125 جرام - سحر الجمال", price: 25, costPrice: 18, barcode: "6221012115011", category: "عناية شخصية وصابون" },
    { name: "لوكس صابون 125 جرام - لمسة ناعمة", price: 25, costPrice: 18, barcode: "6221012115028", category: "عناية شخصية وصابون" },
    { name: "لوكس شاور جل 500 مل", price: 135, costPrice: 105, barcode: "6221012115042", category: "عناية شخصية وصابون" },
    { name: "دوف صابون 125 جرام", price: 45, costPrice: 35, barcode: "6221012116018", category: "عناية شخصية وصابون" },
    { name: "دوف شامبو 400 مل", price: 125, costPrice: 95, barcode: "6221012116025", category: "عناية شخصية وصابون" },
    { name: "ديتول صابون 125 جرام أزرق", price: 28, costPrice: 22, barcode: "5000158067103", category: "عناية شخصية وصابون" },
    { name: "ديتول صابون 125 جرام أخضر", price: 28, costPrice: 22, barcode: "5000158067110", category: "عناية شخصية وصابون" },
    { name: "لايف بوي صابون 125 جرام", price: 22, costPrice: 16, barcode: "6221012117015", category: "عناية شخصية وصابون" },
    { name: "ريكسونا سبراي رجالي", price: 125, costPrice: 95, barcode: "8801019011012", category: "عناية شخصية وصابون" },
    { name: "ريكسونا سبراي حريمي", price: 125, costPrice: 95, barcode: "8801019011029", category: "عناية شخصية وصابون" },
    { name: "صن سيلك شامبو 400 مل أبيض", price: 115, costPrice: 85, barcode: "6221012118012", category: "عناية شخصية وصابون" },
    { name: "صن سيلك شامبو 400 مل أسود", price: 115, costPrice: 85, barcode: "6221012118029", category: "عناية شخصية وصابون" },
    { name: "بانتين شامبو 400 مل", price: 135, costPrice: 105, barcode: "6221006115011", category: "عناية شخصية وصابون" },
    { name: "سجنال معجون أسنان 120 مل", price: 65, costPrice: 48, barcode: "6221012119019", category: "عناية شخصية وصابون" },
    { name: "كلوز اب معجون أسنان 120 مل", price: 68, costPrice: 50, barcode: "6221012119026", category: "عناية شخصية وصابون" },

    // --- منظفات تواليت وأرضيات ---
    { name: "هاربيك أزرق 750 مل", price: 98, costPrice: 78, barcode: "5000158069350", category: "منظفات تواليت وأرضيات" },
    { name: "هاربيك أحمر 750 مل", price: 98, costPrice: 78, barcode: "5000158069367", category: "منظفات تواليت وأرضيات" },
    { name: "هاربيك أسود 750 مل", price: 115, costPrice: 90, barcode: "5000158069374", category: "منظفات تواليت وأرضيات" },
    { name: "فلاش منظف تواليت 500 مل", price: 45, costPrice: 32, barcode: "6221035100100", category: "منظفات تواليت وأرضيات" },
    { name: "مستر مصل منظف زجاج 500 مل", price: 65, costPrice: 48, barcode: "5000204123012", category: "منظفات تواليت وأرضيات" },
    { name: "جليد معطر جو 300 مل", price: 85, costPrice: 65, barcode: "5000204123050", category: "منظفات تواليت وأرضيات" },
    { name: "بليدج ملمع خشب 300 مل", price: 95, costPrice: 75, barcode: "5000204123067", category: "منظفات تواليت وأرضيات" },

    // --- منظفات سايبة (PriceType: weight) ---
    { name: "برسيل سايب أوتوماتيك (كيلو)", price: 65, costPrice: 52, barcode: "SAIB-PERSIL-AUTO", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "إريال سايب أوتوماتيك (كيلو)", price: 68, costPrice: 55, barcode: "SAIB-ARIEL-AUTO", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "أوكسي سايب أوتوماتيك (كيلو)", price: 55, costPrice: 44, barcode: "SAIB-OXI-AUTO", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "صابون سائل سايب ممتاز (كيلو)", price: 12, costPrice: 8, barcode: "SAIB-SOAP-LUX", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "صابون سائل سايب عادي (كيلو)", price: 8, costPrice: 5, barcode: "SAIB-SOAP-REG", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "كلور سايب أبيض (كيلو)", price: 5, costPrice: 2, barcode: "SAIB-CLOR-WHITE", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "كلور سايب ألوان (كيلو)", price: 15, costPrice: 10, barcode: "SAIB-CLOR-COLOR", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "داوني سايب مركز (كيلو)", price: 25, costPrice: 18, barcode: "SAIB-DOWNY", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "كومفورت سايب (كيلو)", price: 22, costPrice: 16, barcode: "SAIB-COMFORT", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "فنيش سايب أوتوماتيك (كيلو)", price: 45, costPrice: 35, barcode: "SAIB-FINISH", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "شاور جل سايب (كيلو)", price: 35, costPrice: 25, barcode: "SAIB-SHOWER", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
    { name: "مطهر ديتول سايب (كيلو)", price: 40, costPrice: 30, barcode: "SAIB-DETTOL", category: "منظفات سايبة", priceType: "weight", unit: "كجم" },
  ];

  // Adding 30+ more personal care & varied items to reach 100+
  const extraItems = [
    { name: "شامبو هيد اند شولدرز 400 مل", price: 145, costPrice: 115, barcode: "6221006115028", category: "عناية شخصية وصابون" },
    { name: "شامبو جونسون للأطفال 200 مل", price: 85, costPrice: 65, barcode: "6221003114013", category: "عناية شخصية وصابون" },
    { name: "زيت جونسون للأطفال 200 مل", price: 95, costPrice: 75, barcode: "6221003114020", category: "عناية شخصية وصابون" },
    { name: "فا صابون 125 جرام", price: 18, costPrice: 14, barcode: "6221012301049", category: "عناية شخصية وصابون" },
    { name: "فا سبراي مزيل عرق", price: 110, costPrice: 85, barcode: "6221012301056", category: "عناية شخصية وصابون" },
    { name: "نيفيا كريم 150 مل", price: 135, costPrice: 110, barcode: "4005808151011", category: "عناية شخصية وصابون" },
    { name: "نيفيا رول اون", price: 85, costPrice: 65, barcode: "4005808151028", category: "عناية شخصية وصابون" },
    { name: "كاماي صابون 125 جرام", price: 20, costPrice: 15, barcode: "6221006116049", category: "عناية شخصية وصابون" },
    { name: "بالمرز كريم شعر", price: 165, costPrice: 135, barcode: "010181040009", category: "عناية شخصية وصابون" },
    { name: "بريل 350 مل صغير", price: 22, costPrice: 16, barcode: "6221012301063", category: "صابون سائل ومواعين" },
    { name: "فيبا 3 لتر", price: 115, costPrice: 90, barcode: "6221035100186", category: "صابون سائل ومواعين" },
    { name: "اوكسي 3 كجم اوتوماتيك", price: 265, costPrice: 220, barcode: "6221035102074", category: "مساحيق أوتوماتيك" },
    { name: "برسيل 1.5 كجم اوتوماتيك", price: 155, costPrice: 125, barcode: "6221012111037", category: "مساحيق أوتوماتيك" },
  ];

  const allProductsData = [...productsData, ...extraItems];

  // Batch insertion to avoid connection issues
  const batchSize = 10;
  for (let i = 0; i < allProductsData.length; i += batchSize) {
    const batch = allProductsData.slice(i, i + batchSize);
    await Promise.all(batch.map(p => {
      const cat = createdCategories[(p as any).category];
      return prisma.product.create({
        data: {
          name: p.name,
          price: p.price,
          costPrice: p.costPrice,
          barcode: p.barcode,
          priceType: (p as any).priceType || "unit",
          unit: (p as any).unit || "قطعة",
          categoryId: cat ? cat.id : createdCategories["مساحيق أوتوماتيك"].id,
          stock: 100,
          minStock: 10,
        }
      });
    }));
    console.log(`Inserted batch ${i / batchSize + 1}...`);
    await new Promise(r => setTimeout(r, 500)); // 500ms delay between batches
  }

  console.log(`Seeding Completed! Added ${allProductsData.length} real products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
