import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const trader = await prisma.trader.update({ where: { id }, data: body });
    return NextResponse.json(trader);
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    // Delete associated invoices and items first if needed, but we rely on Cascade or manual cleanup
    // Actually, trader invoices don't cascade, so we must delete them first
    const id = parseInt(params.id);
    const invoices = await prisma.traderInvoice.findMany({ where: { traderId: id } });
    const invoiceIds = invoices.map(i => i.id);
    
    // Delete all invoice items for these invoices
    await prisma.traderInvoiceItem.deleteMany({ where: { traderInvoiceId: { in: invoiceIds } } });
    
    // Delete the invoices
    await prisma.traderInvoice.deleteMany({ where: { traderId: id } });
    
    // Delete the trader
    await prisma.trader.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) { 
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
