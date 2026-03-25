import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, SystemSettings, Payment, DayBooking, Leave } from "@/lib/models";
import { getBillingSummary } from "@/lib/utils";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const customers = await User.find({ role: "CUSTOMER" }).lean();
  const customerIds = customers.map((c) => c._id);
  const [paymentsAll, bookingsAll, settings, allLeaves] = await Promise.all([
    customerIds.length
      ? Payment.find({ userId: { $in: customerIds } }).lean()
      : Promise.resolve([]),
    customerIds.length
      ? DayBooking.find({ userId: { $in: customerIds } })
          .select({ userId: 1, date: 1, mealType: 1 })
          .lean()
      : Promise.resolve([]),
    SystemSettings.findById("default")
      .select({ breakfastPrice: 1, lunchPrice: 1, dinnerPrice: 1 })
      .lean(),
    customerIds.length
      ? Leave.find({ userId: { $in: customerIds } }).select({
          userId: 1,
          date: 1,
          mealType: 1,
        }).lean()
      : Promise.resolve([]),
  ]);
  const paymentsByUser = new Map<string, { amount: number }[]>();
  for (const p of paymentsAll) {
    const list = paymentsByUser.get(p.userId) ?? [];
    list.push({ amount: p.amount });
    paymentsByUser.set(p.userId, list);
  }
  const bookingsByUser = new Map<string, { date: Date; mealType: string }[]>();
  for (const b of bookingsAll) {
    const list = bookingsByUser.get(b.userId) ?? [];
    list.push({ date: b.date, mealType: b.mealType });
    bookingsByUser.set(b.userId, list);
  }
  const leavesByUser = new Map<string, { date: Date; mealType: string }[]>();
  for (const row of allLeaves) {
    const list = leavesByUser.get(row.userId) ?? [];
    list.push({ date: row.date, mealType: row.mealType });
    leavesByUser.set(row.userId, list);
  }
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
        bookingsByUser.get(c._id) ?? [],
        leavesByUser.get(c._id) ?? [],
        mealPrices,
        (paymentsByUser.get(c._id) ?? []).map((payment) => payment.amount),
        today
      );
      return {
        id: c._id,
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
