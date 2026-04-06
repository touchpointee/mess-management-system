import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, Payment, DeliveryLocation, Leave, SystemSettings, MessHoliday } from "@/lib/models";
import { applyOfferMealPrices, getBillingSummary, getNextDueDate } from "@/lib/utils";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found; session may be stale. Please log out and log in again." }, { status: 401 });
  }
  const [payments, locations, leaves, messHolidays] = await Promise.all([
    Payment.find({ userId }).sort({ date: -1 }).lean(),
    DeliveryLocation.find({ userId }).lean(),
    Leave.find({ userId }).select({ date: 1, mealType: 1 }).lean(),
    MessHoliday.find().lean() as Promise<{ date: Date; mealType: string }[]>,
  ]);
  const today = new Date();
  const settings = await SystemSettings.findById("default")
    .select({ breakfastPrice: 1, lunchPrice: 1, dinnerPrice: 1 })
    .lean();
  const mealPrices = {
    breakfastPrice: settings?.breakfastPrice ?? 0,
    lunchPrice: settings?.lunchPrice ?? 0,
    dinnerPrice: settings?.dinnerPrice ?? 0,
  };
  const effectivePrices = applyOfferMealPrices(mealPrices, {
    offerBreakfastPrice: (user as { offerBreakfastPrice?: number | null }).offerBreakfastPrice ?? null,
    offerLunchPrice: (user as { offerLunchPrice?: number | null }).offerLunchPrice ?? null,
    offerDinnerPrice: (user as { offerDinnerPrice?: number | null }).offerDinnerPrice ?? null,
  });
  const billingStart = user.startDate ? new Date(user.startDate) : null;
  const billingEnd = user.endDate ? new Date(user.endDate) : null;
  const billing = getBillingSummary(
    billingStart,
    billingEnd,
    leaves.map((l) => ({ date: l.date, mealType: l.mealType })),
    messHolidays,
    effectivePrices,
    payments.map((payment) => payment.amount),
    today
  );
  const nextDue =
    billingStart && !isNaN(billingStart.getTime())
      ? getNextDueDate(billingStart)
      : null;

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address,
      startDate: user.startDate,
      endDate: user.endDate,
    },
    offerPrices: {
      breakfast: (user as { offerBreakfastPrice?: number | null }).offerBreakfastPrice ?? null,
      lunch: (user as { offerLunchPrice?: number | null }).offerLunchPrice ?? null,
      dinner: (user as { offerDinnerPrice?: number | null }).offerDinnerPrice ?? null,
    },
    effectiveMealPrices: effectivePrices,
    payments: payments.map((p) => ({
      id: p._id,
      date: p.date,
      amount: p.amount,
      note: p.note,
    })),
    cyclesCompleted: billing.cyclesCompleted,
    billableMealCount: billing.billableMealCount,
    totalDue: billing.totalDue,
    totalPaid: billing.totalPaid,
    balance: billing.netBalance,
    dueAmount: billing.dueAmount,
    advanceAmount: billing.advanceAmount,
    nextDueDate: nextDue,
    locations: locations.map((l) => ({
      id: l._id,
      userId: l.userId,
      label: l.label,
      address: l.address,
      lat: l.lat,
      lng: l.lng,
      mealType: l.mealType,
      isDefault: l.isDefault,
    })),
  });
}
