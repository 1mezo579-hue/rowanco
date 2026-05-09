import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ─── GET products (with search and limit) ────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "1000");

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query } },
      ];
    }
    if (category && category !== "all") {
      where.category = { name: category };
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        barcode: true,
        price: true,
        costPrice: true,
        stock: true,
        minStock: true,
        priceType: true,
        unit: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
      take: query ? 50 : limit, // Fetch more if no query, or less if query
    });
    return NextResponse.json(products);
  } catch (e: any) {
    console.error("GET products error:", e.message);
    return NextResponse.json({ error: "فشل في جلب المنتجات" }, { status: 500 });
  }
}

// ─── POST create product ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, barcode, categoryId, priceType, price, costPrice, stock, minStock, unit } = body;

    if (!name?.trim() || !categoryId || !price) {
      return NextResponse.json({ error: "الاسم والقسم والسعر مطلوبة" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        barcode: barcode?.trim() || null,
        categoryId: Number(categoryId),
        priceType: priceType || "unit",
        price: Number(price),
        costPrice: Number(costPrice) || 0,
        stock: Number(stock) || 0,
        minStock: Number(minStock) || 5,
        unit: unit || "piece",
      },
      include: { category: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "الباركود مستخدم لمنتج آخر" }, { status: 400 });
    }
    console.error("POST product error:", e.message);
    return NextResponse.json({ error: "فشل في إضافة المنتج" }, { status: 500 });
  }
}