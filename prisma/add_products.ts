import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding new detergent products and loose items...");

  // 1. Categories
  const looseCategory = await prisma.category.upsert({
    where: { name: "منظفات سايبة" },
    update: {},
    create: { name: "منظفات سايبة" },
  });

  const careCategory = await prisma.category.upsert({
    where: { name: "عناية شخصية وصابون" },
    update: {},
    create: { name: "عناية شخصية وصابون" },
  });

  const laundryCategory = await prisma.category.upsert({
    where: { name: "مساحيق غسيل" },
    update: {},
    create: { name: "مساحيق غسيل" },
  });

  // 2. Loose Products (5 to 50 EGP)
  const loosePrices = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  for (const price of loosePrices) {
    await prisma.product.upsert({
      where: { barcode: `LOOSE-${price}` },
      update: { price, costPrice: price * 0.8 },
      create: {
        name: `منظفات سايبة - ${price} جنيه`,
        barcode: `LOOSE-${price}`,
        price: price,
        costPrice: price * 0.8,
        categoryId: looseCategory.id,
        stock: 999,
        unit: "جنيه",
        priceType: "unit",
      },
    });
  }

  // 3. Rexona Products
  const rexonaItems = [
    { name: "ريكسونا سبراي مزيل عرق - أزرق", price: 125, costPrice: 95, barcode: "8801019011012" },
    { name: "ريكسونا سبراي مزيل عرق - فضي", price: 125, costPrice: 95, barcode: "8801019011029" },
    { name: "ريكسونا رول أون - قطن", price: 85, costPrice: 65, barcode: "8801019011036" },
    { name: "ريكسونا صابون 125 جرام", price: 28, costPrice: 22, barcode: "8801019011043" },
  ];

  for (const item of rexonaItems) {
    await prisma.product.upsert({
      where: { barcode: item.barcode },
      update: { price: item.price, costPrice: item.costPrice },
      create: {
        name: item.name,
        barcode: item.barcode,
        price: item.price,
        costPrice: item.costPrice,
        categoryId: careCategory.id,
        stock: 50,
      },
    });
  }

  // 4. More Lux Products
  const luxItems = [
    { name: "لوكس شاور جل 500 مل - سحر الجمال", price: 135, costPrice: 105, barcode: "6221012115011" },
    { name: "لوكس شاور جل 500 مل - نعومة مخملية", price: 135, costPrice: 105, barcode: "6221012115028" },
    { name: "لوكس صابون سائل لليدين 250 مل", price: 65, costPrice: 48, barcode: "6221012115035" },
  ];

  for (const item of luxItems) {
    await prisma.product.upsert({
      where: { barcode: item.barcode },
      update: { price: item.price, costPrice: item.costPrice },
      create: {
        name: item.name,
        barcode: item.barcode,
        price: item.price,
        costPrice: item.costPrice,
        categoryId: careCategory.id,
        stock: 50,
      },
    });
  }

  // 5. Ariel & Persil Additional
  const laundryItems = [
    { name: "برسيل بلاك 2.5 لتر", price: 195, costPrice: 160, barcode: "6221012111203" },
    { name: "إريال أوتوماتيك بودر 1.5 كجم", price: 155, costPrice: 125, barcode: "6221006114106" },
    { name: "إريال بودر غسيل يدوي 200 جرام", price: 18, costPrice: 14, barcode: "6221006114007" },
  ];

  for (const item of laundryItems) {
    await prisma.product.upsert({
      where: { barcode: item.barcode },
      update: { price: item.price, costPrice: item.costPrice },
      create: {
        name: item.name,
        barcode: item.barcode,
        price: item.price,
        costPrice: item.costPrice,
        categoryId: laundryCategory.id,
        stock: 50,
      },
    });
  }

  console.log("New products added successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
