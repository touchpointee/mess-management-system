import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { getBillingSummary } from "@/lib/utils";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      plan: true,
      payments: { orderBy: { date: "desc" } },
      locations: true,
      bookings: { select: { date: true, mealType: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ message: "User not found; session may be stale. Please log out and log in again." }, { status: 401 });
  }
  const today = new Date();
  const plan = user.plan;
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" },
    select: { breakfastPrice: true, lunchPrice: true, dinnerPrice: true },
  });
  const mealPrices = {
    breakfastPrice: settings?.breakfastPrice ?? 0,
    lunchPrice: settings?.lunchPrice ?? 0,
    dinnerPrice: settings?.dinnerPrice ?? 0,
  };
  const billing = getBillingSummary(
    user.bookings.map((booking) => ({
      date: booking.date,
      mealType: booking.mealType,
    })),
    mealPrices,
    user.payments.map((payment) => payment.amount),
    today
  );

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address,
    },
    plan: plan
      ? {
          monthlyFee: plan.monthlyFee,
          startDate: plan.startDate,
          isActive: plan.isActive,
        }
      : null,
    payments: user.payments.map((p) => ({
      id: p.id,
      date: p.date,
      amount: p.amount,
      note: p.note,
    })),
    cyclesCompleted: billing.cyclesCompleted,
    totalDue: billing.totalDue,
    totalPaid: billing.totalPaid,
    balance: billing.netBalance,
    dueAmount: billing.dueAmount,
    advanceAmount: billing.advanceAmount,
    locations: user.locations,
  });
}
