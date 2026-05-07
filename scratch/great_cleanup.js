const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Starting the Great Cleanup...");

  // 1. Define Standard Categories
  const standardCategories = {
    'ألبان وجبن': ['لبن', 'جبن', 'زبادي', 'قشطة', 'كيري', 'دومتي', 'عبور لاند', 'جهينة', 'لاكتيل', 'بريزيدن', 'طعمة', 'مثلثات'],
    'زيوت وسمن': ['زيت', 'سمن', 'زبدة', 'كريستال', 'هلا', 'عافية', 'سلايت', 'قلية', 'الاصيل', 'روابي', 'جنة', 'الهانم', 'شورتنج'],
    'مكرونات ورز وبقوليات': ['مكرونة', 'أرز', 'رز', 'عدس', 'فول', 'لوبيا', 'فاصوليا', 'الضحى', 'الساعة', 'الملكة', 'روجينا', 'كايرو', 'ستار', 'ايطاليانو'],
    'مشروبات غازية وعصائر': ['بيبسي', 'كوكا', 'فانتا', 'سبرايت', 'راني', 'بيتي', 'فيروز', 'شويبس', 'عصير', 'بيرة', 'تستيف', 'سفن', 'مياه'],
    'مشروبات ساخنة': ['شاي', 'قهوة', 'بن', 'نسكافيه', 'كاكاو', 'ينسون', 'نعناع', 'تيلو', 'رويال', 'لبتون', 'العروسة', 'مصر كافيه'],
    'منظفات ومنتجات ورقية': ['اريال', 'برسيل', 'تايد', 'اوكسي', 'فيري', 'بريل', 'وفير', 'كلور', 'ديتول', 'داوني', 'فاين', 'زينة', 'بابيا', 'مضغوط', 'حفاضات', 'بامبرز', 'اولويز', 'صابون'],
    'سناكس وشوكولاتة وحلويات': ['شيبسي', 'كرانشي', 'تايجر', 'صن بايتس', 'كادبوري', 'جالاكسي', 'كيت كات', 'كاندي', 'لبان', 'مصاصة', 'بسكويت', 'ويفر', 'بيمبو', 'مورو', 'اوريو'],
    'لحوم ومجمدات': ['لحم', 'فراخ', 'دجاج', 'بانيه', 'كفتة', 'برجر', 'سجق', 'ملوخية', 'اطياب', 'حلواني', 'السلاب', 'مجمد'],
    'معلبات وصلصة': ['صلصة', 'تونة', 'سردين', 'ماكريل', 'عسل', 'طحينة', 'مربى', 'حلاوة', 'كاتشب', 'مايونيز', 'هارفست', 'وادي الغذاء'],
    'بقوليات وعطارة (وزن)': ['وزن', 'سائب', 'بهارات', 'كمون', 'فلفل اسود', 'ملح'],
  };

  // 2. Ensure standard categories exist and get their IDs
  const categoryMap = {};
  for (const name of Object.keys(standardCategories)) {
    let cat = await prisma.category.findUnique({ where: { name } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name } });
    }
    categoryMap[name] = cat.id;
  }

  // 3. Fetch all products
  const products = await prisma.product.findMany();
  console.log(`Analyzing ${products.length} products...`);

  let count = 0;
  for (const product of products) {
    let newCategoryId = product.categoryId;
    let newName = product.name.trim().replace(/\s+/g, ' '); // Fix spaces
    
    // Categorization logic based on keywords
    for (const [catName, keywords] of Object.entries(standardCategories)) {
      if (keywords.some(k => newName.includes(k))) {
        // Special case: "جهينة" could be Milk or Juice
        if (newName.includes('جهينة')) {
           if (newName.includes('عصير')) newCategoryId = categoryMap['مشروبات غازية وعصائر'];
           else newCategoryId = categoryMap['ألبان وجبن'];
        } else {
           newCategoryId = categoryMap[catName];
        }
        break;
      }
    }

    // Price Normalization: If costPrice is 0 or missing, set to 90% of price
    let newCostPrice = product.costPrice;
    if (!newCostPrice || newCostPrice === 0 || newCostPrice >= product.price) {
      newCostPrice = Math.round(product.price * 0.9 * 100) / 100;
    }

    if (newCategoryId !== product.categoryId || newName !== product.name || newCostPrice !== product.costPrice) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: newName,
          categoryId: newCategoryId,
          costPrice: newCostPrice
        }
      });
      count++;
    }
  }

  console.log(`Cleanup complete. Updated ${count} products.`);
  
  // 4. Cleanup Empty/Redundant Categories
  const allCats = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
  for (const cat of allCats) {
    if (cat._count.products === 0 && !Object.keys(standardCategories).includes(cat.name)) {
      await prisma.category.delete({ where: { id: cat.id } }).catch(() => {});
      console.log(`Deleted empty category: ${cat.name}`);
    }
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
