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
    // Strictly Arabic & Optimized for Thermal Printers
    const date = new Date().toLocaleString("ar-EG", { hour12: true });
    const content = [
      "================================",
      "       روانـكـو لـلـمـنـظـفـات",
      "================================",
      `رقم الفاتورة: ${receiptData.invoiceNo}`,
      `التاريخ: ${date}`,
      `العميل: ${receiptData.customerName || "عميل نقدي"}`,
      "--------------------------------",
      "الصنف          الكمية   السعر",
      "--------------------------------",
      ...receiptData.items.map((item: any) => {
        const name = (item.name.length > 15 ? item.name.substring(0, 12) + ".." : item.name).padEnd(15);
        const qty = item.quantity.toString().padEnd(7);
        const price = item.price.toString();
        return `${name} ${qty} ${price}`;
      }),
      "--------------------------------",
      `المجموع: ${receiptData.total} ج.م`,
      `الخصم: ${receiptData.discount} ج.م`,
      `الإجمالي: ${receiptData.finalTotal} ج.م`,
      "--------------------------------",
      "      شكراً لزيارتكم!",
      "   جودة توفر لك - روانكو",
      "================================",
      "\n\n\n"
    ].join("\n");

    // Only attempt direct printing on Windows (Local Machine)
    if (process.platform !== "win32") {
      return NextResponse.json({ error: "Direct printing only supported on local Windows machine" }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const tempFile = path.join(tempDir, `receipt_${receiptData.invoiceNo}.txt`);
    
    // Write as UTF-16 Little Endian (Unicode) which Windows/PowerShell handles best for Arabic
    fs.writeFileSync(tempFile, Buffer.from('\ufeff' + content, 'utf16le'));

    // Print using PowerShell with explicit unicode handling
    await execAsync(`powershell -Command "Get-Content -Path '${tempFile}' -Encoding Unicode | Out-Printer"`);
    
    // Auto-delete temp file
    setTimeout(() => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); }, 10000);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Printing Error:", error);
    return NextResponse.json({ error: "فشل في خدمة الطباعة المباشرة" }, { status: 500 });
  }
}
