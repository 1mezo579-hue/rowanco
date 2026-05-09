import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { receiptData } = await req.json();
    
    // Create a text-based receipt content
    const date = new Date().toLocaleString("ar-EG");
    const content = `
================================
     روانكو للمنظفات (Rowanco)
================================
فاتورة رقم: ${receiptData.invoiceNo}
التاريخ: ${date}
العميل: ${receiptData.customerName || "عميل طياري"}
--------------------------------
الصنف          الكمية   السعر   الإجمالي
--------------------------------
${receiptData.items.map((item: any) => 
  `${item.name.padEnd(15)} ${item.quantity.toString().padEnd(6)} ${item.price.toString().padEnd(6)} ${item.total}`
).join("\n")}
--------------------------------
المجموع: ${receiptData.total} ج.م
الخصم: ${receiptData.discount} ج.م
الإجمالي النهائي: ${receiptData.finalTotal} ج.م
--------------------------------
شكراً لزيارتكم!
روانكو - أفضل جودة وأقل سعر
================================
    `.trim();

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const tempFile = path.join(tempDir, `receipt_${receiptData.invoiceNo}.txt`);
    fs.writeFileSync(tempFile, content, "utf8");

    // PowerShell command to print to the default printer
    // We use -Raw to ensure no extra formatting is added by PowerShell
    await execAsync(`powershell -Command "Get-Content -Path '${tempFile}' | Out-Printer"`);
    
    // Optionally delete after print
    setTimeout(() => {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }, 5000);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Printing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
