import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ─── GET all trader payments ──────────────────────────────────────────────────
export async function GET() {
  try {
    const payments = await prisma.traderPayment.findMany({
      include: {
        trader: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(payments);
  } catch (e: any) {
    console.error("GET trader payments error:", e.message);
    return NextResponse.json({ error: "فشل تحميل المدفوعات" }, { status: 500 });
  }
}

// ─── POST create trader payment ───────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { traderId, amount, method, notes, userId } = await req.json();

    if (!traderId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "بيانات الدفع غير مكتملة" }, { status: 400 });
    }

    const amountNum = Number(amount);

    // ── Step 1: Create payment and update trader balance in a transaction ──
    const payment = await prisma.$transaction(async (tx) => {
      // 1. Create payment record
      const p = await tx.traderPayment.create({
        data: {
          traderId: Number(traderId),
          amount: amountNum,
          method: method || "cash",
          notes: notes || null,
        },
        include: { trader: { select: { name: true } } },
      });

      // 2. Decrease trader balance (positive balance means we owe them)
      await tx.trader.update({
        where: { id: Number(traderId) },
        data: { balance: { decrement: amountNum } },
      });

      // 3. (Optional) Log as an expense if userId is provided
      if (userId) {
        await tx.expense.create({
          data: {
            amount: amountNum,
            category: "مشتريات",
            description: `سداد للتاجر: ${p.trader.name}. ${notes || ""}`,
            userId: Number(userId),
          },
        });
      }

      return p;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (e: any) {
    console.error("POST trader payment error:", e.message);
    return NextResponse.json({ error: "فشل تسجيل عملية الدفع" }, { status: 500 });
  }
}
