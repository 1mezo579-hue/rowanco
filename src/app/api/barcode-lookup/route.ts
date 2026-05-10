import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  try {
    // 1. Try Open Food Facts (Good for some FMCG)
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
              source: "OpenFacts"
            });
          }
        }
      } catch (e) {
        // Ignore and continue
      }
    }

    // 2. Try DuckDuckGo Search Scraping (The ultimate hack for local Egyptian products!)
    // If a product is sold on Amazon.eg, Jumia, or Carrefour, the barcode will often yield the product page!
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q="${code}"`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
      if (searchRes.ok) {
        const html = await searchRes.text();
        
        // Extract the first search result title using Regex
        const titleMatch = html.match(/<a class="result__snippet[^>]*>([^<]+)<\/a>/i) || html.match(/<h2 class="result__title">.*?<a[^>]*>(.*?)<\/a>.*?<\/h2>/is);
        
        if (titleMatch && titleMatch[1]) {
          let rawTitle = titleMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove any inner HTML tags
          
          // Clean up common ecommerce junk words
          const junkWords = [
            "Buy", "Online", "Price", "Egypt", "Carrefour", "Amazon.eg", "Jumia", "Souq", 
            "شراء", "اونلاين", "سعر", "مصر", "كارفور", "أمازون", "جوميا", "سوق", "|", "-", "في", "من"
          ];
          
          let cleanTitle = rawTitle;
          junkWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            cleanTitle = cleanTitle.replace(regex, "");
          });
          
          cleanTitle = cleanTitle.replace(/[\-\|:؛،,]+/g, " ").replace(/\s\s+/g, ' ').trim();

          if (cleanTitle.length > 3) {
            return NextResponse.json({ 
              name: cleanTitle,
              source: "SearchScrape",
              originalTitle: rawTitle
            });
          }
        }
      }
    } catch (e) {
      console.error("Scraping failed:", e);
    }

    // 3. Fallback to UPCitemdb
    try {
      const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
      if (upcRes.ok) {
        const upcData = await upcRes.json();
        if (upcData && upcData.items && upcData.items.length > 0) {
          return NextResponse.json({
            name: upcData.items[0].title,
            source: "UPCitemdb"
          });
        }
      }
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({ error: "Product not found anywhere on the internet" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to lookup barcode" }, { status: 500 });
  }
}
