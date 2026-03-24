import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { getBillingSummary } from "@/lib/utils";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { payments: true, bookings: { select: { date: true, mealType: true } } },
  });
  const customerIds = customers.map((c) => c.id);
  const allLeaves =
    customerIds.length === 0
      ? []
      : await prisma.leave.findMany({
          where: { userId: { in: customerIds } },
          select: { userId: true, date: true, mealType: true },
        });
  const leavesByUser = new Map<string, { date: Date; mealType: string }[]>();
  for (const row of allLeaves) {
    const list = leavesByUser.get(row.userId) ?? [];
    list.push({ date: row.date, mealType: row.mealType });
    leavesByUser.set(row.userId, list);
  }
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" },
    select: { breakfastPrice: true, lunchPrice: true, dinnerPrice: true },
  });
  const mealPrices = {
    breakfastPrice: settings?.breakfastPrice ?? 0,
    lunchPrice: settings?.lunchPrice ?? 0,
    dinnerPrice: settings?.dinnerPrice ?? 0,
  };
  const today = new Date();
  const due = customers
    .map((c) => {
      const billing = getBillingSummary(
        c.startDate ? new Date(c.startDate) : null,
        c.bookings.map((booking) => ({
          date: booking.date,
          mealType: booking.mealType,
        })),
        leavesByUser.get(c.id) ?? [],
        mealPrices,
        c.payments.map((payment) => payment.amount),
        today
      );
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        cyclesCompleted: billing.cyclesCompleted,
        billableMeals: billing.billableMealCount,
        totalDue: billing.totalDue,
        totalPaid: billing.totalPaid,
        balance: billing.netBalance,
        dueAmount: billing.dueAmount,
        advanceAmount: billing.advanceAmount,
      };
    })
    .filter((x) => x.dueAmount > 0)
    .sort((a, b) => b.dueAmount - a.dueAmount);
  return NextResponse.json(due);
}
