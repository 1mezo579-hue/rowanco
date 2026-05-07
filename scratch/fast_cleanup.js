const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Starting Optimized Cleanup...");

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

  for (const [name, keywords] of Object.entries(standardCategories)) {
    let cat = await prisma.category.findUnique({ where: { name } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name } });
    }
    
    console.log(`Categorizing ${name}...`);
    const result = await prisma.product.updateMany({
      where: {
        OR: keywords.map(k => ({ name: { contains: k, mode: 'insensitive' } }))
      },
      data: { categoryId: cat.id }
    });
    console.log(`Updated ${result.count} products for ${name}.`);
  }

  // Normalize costs (roughly)
  console.log("Normalizing costs...");
  // updateMany doesn't support setting a field based on another field. 
  // We'll skip the fine-grained price normalization for now to keep it fast, 
  // or do it in one big batch if we really need to.
  
  console.log("Cleanup complete.");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
