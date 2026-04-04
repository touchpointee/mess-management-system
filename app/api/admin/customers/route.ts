import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { hash } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User, SystemSettings, Payment, DayBooking, Leave } from "@/lib/models";
import { applyOfferMealPrices, daysBetween, getBillingSummary } from "@/lib/utils";
import { Role } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const customers = await User.find({ role: Role.CUSTOMER }).lean();
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
  const list = customers.map((c) => {
    const startDate = c.startDate ? new Date(c.startDate) : null;
    const payList = paymentsByUser.get(c._id) ?? [];
    const effectivePrices = applyOfferMealPrices(mealPrices, {
      offerBreakfastPrice: (c as { offerBreakfastPrice?: number | null }).offerBreakfastPrice ?? null,
      offerLunchPrice: (c as { offerLunchPrice?: number | null }).offerLunchPrice ?? null,
      offerDinnerPrice: (c as { offerDinnerPrice?: number | null }).offerDinnerPrice ?? null,
    });
    const billing = getBillingSummary(
      startDate,
      bookingsByUser.get(c._id) ?? [],
      leavesByUser.get(c._id) ?? [],
      effectivePrices,
      payList.map((payment) => payment.amount),
      today
    );
    const daysActive = startDate ? daysBetween(startDate, today) : 0;
    return {
      id: c._id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      startDate: c.startDate ?? null,
      daysActive,
      balanceDue: billing.netBalance,
      dueAmount: billing.dueAmount,
      advanceAmount: billing.advanceAmount,
      offerPrices: {
        breakfast: (c as { offerBreakfastPrice?: number | null }).offerBreakfastPrice ?? null,
        lunch: (c as { offerLunchPrice?: number | null }).offerLunchPrice ?? null,
        dinner: (c as { offerDinnerPrice?: number | null }).offerDinnerPrice ?? null,
      },
    };
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      password,
      address,
      lat,
      lng,
      startDate,
    } = body as {
      name: string;
      phone: string;
      email?: string;
      password: string;
      address?: string;
      lat?: number;
      lng?: number;
      startDate?: string;
    };
    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: "name, phone, password required" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await User.findOne({
      $or: [{ phone }, ...(email ? [{ email }] : [])],
    }).lean();
    if (existing) {
      return NextResponse.json(
        { message: "Phone or email already exists" },
        { status: 400 }
      );
    }
    const hashed = await hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      password: hashed,
      role: Role.CUSTOMER,
      address: address?.trim() || null,
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
    });
    return NextResponse.json({ success: true, id: user._id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
