import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  try {
    // We will try multiple open databases for products
    const apis = [
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      `https://world.openbeautyfacts.org/api/v0/product/${code}.json`,
      `https://world.openproductsfacts.org/api/v0/product/${code}.json`
    ];

    for (const apiUrl of apis) {
      try {
        const res = await fetch(apiUrl, { next: { revalidate: 3600 } });
        if (res.ok) {
          const data = await res.json();
          if (data && data.status === 1 && data.product && data.product.product_name) {
            return NextResponse.json({ 
              name: data.product.product_name_ar || data.product.product_name_en || data.product.product_name,
              brand: data.product.brands || "",
            });
          }
        }
      } catch (e) {
        // Ignore fetch errors for individual APIs and try the next one
        console.error(`Error fetching from ${apiUrl}:`, e);
      }
    }

    // Try UPCitemdb as a fallback
    try {
      const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
      if (upcRes.ok) {
        const upcData = await upcRes.json();
        if (upcData && upcData.items && upcData.items.length > 0) {
          return NextResponse.json({
            name: upcData.items[0].title,
            brand: upcData.items[0].brand || "",
          });
        }
      }
    } catch (e) {
      console.error("Error fetching from UPCitemdb:", e);
    }

    return NextResponse.json({ error: "Product not found in global databases" }, { status: 404 });
  } catch (error: any) {
    console.error("Barcode lookup error:", error);
    return NextResponse.json({ error: "Failed to lookup barcode" }, { status: 500 });
  }
}
