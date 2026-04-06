import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, Leave, DayBooking, DeliveryLocation, Payment, SystemSettings, MessHoliday } from "@/lib/models";
import { applyOfferMealPrices, buildLedgerAndMonthlyClosing, getBillingSummary } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const leavesPage = Math.max(1, Number(searchParams.get("leavesPage") ?? 1));
  const leavesLimit = Math.min(
    100,
    Math.max(10, Number(searchParams.get("leavesLimit") ?? 50))
  );
  const bookingsPage = Math.max(1, Number(searchParams.get("bookingsPage") ?? 1));
  const bookingsLimit = Math.min(
    100,
    Math.max(10, Number(searchParams.get("bookingsLimit") ?? 50))
  );
  const { id } = await params;
  await connectDB();
  const user = await User.findOne({ _id: id, role: "CUSTOMER" }).lean();
  if (!user) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  const [payments, locations, leavesPageRows, bookingsPageRows] =
    await Promise.all([
      Payment.find({ userId: id }).sort({ date: 1 }).lean(),
      DeliveryLocation.find({ userId: id }).lean(),
      Leave.find({ userId: id })
        .sort({ date: -1 })
        .skip((leavesPage - 1) * leavesLimit)
        .limit(leavesLimit)
        .lean(),
      DayBooking.find({ userId: id })
        .sort({ date: -1 })
        .skip((bookingsPage - 1) * bookingsLimit)
        .limit(bookingsLimit)
        .lean(),
    ]);
  const [leavesCount, bookingsCount, allLeaves, messHolidays] =
    await Promise.all([
      Leave.countDocuments({ userId: id }).exec(),
      DayBooking.countDocuments({ userId: id }).exec(),
      Leave.find({ userId: id }).select({ date: 1, mealType: 1 }).lean(),
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
    allLeaves.map((l) => ({ date: l.date, mealType: l.mealType })),
    messHolidays,
    effectivePrices,
    payments.map((payment) => payment.amount),
    today
  );
  const { ledger, monthlyClosing } = buildLedgerAndMonthlyClosing(
    billingStart,
    billingEnd,
    allLeaves.map((l) => ({ date: l.date, mealType: l.mealType })),
    messHolidays,
    effectivePrices,
    payments.map((payment) => ({
      id: payment._id,
      amount: payment.amount,
      date: payment.date,
      note: payment.note,
    })),
    today
  );
  const paymentRunningById = new Map(
    ledger.filter((l) => l.type === "PAYMENT").map((l) => [l.id, l.runningBalance])
  );
  const paymentHistory = payments.map((p) => {
    return {
      id: p._id,
      date: p.date,
      amount: p.amount,
      note: p.note,
      runningBalance: paymentRunningById.get(p._id) ?? 0,
    };
  });
  const { password: _pw, _id: _uid, ...userRest } = user;
  return NextResponse.json({
    ...userRest,
    id: user._id,
    offerPrices: {
      breakfast: (user as { offerBreakfastPrice?: number | null }).offerBreakfastPrice ?? null,
      lunch: (user as { offerLunchPrice?: number | null }).offerLunchPrice ?? null,
      dinner: (user as { offerDinnerPrice?: number | null }).offerDinnerPrice ?? null,
    },
    effectiveMealPrices: effectivePrices,
    payments: payments.map((p) => ({
      id: p._id,
      userId: p.userId,
      amount: p.amount,
      date: p.date,
      note: p.note,
      createdAt: p.createdAt,
    })),
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
    leaves: leavesPageRows.map((l) => ({
      id: l._id,
      userId: l.userId,
      date: l.date,
      mealType: l.mealType,
      createdAt: l.createdAt,
    })),
    bookings: bookingsPageRows.map((b) => ({
      id: b._id,
      userId: b.userId,
      date: b.date,
      mealType: b.mealType,
      deliveryLocationId: b.deliveryLocationId,
      createdAt: b.createdAt,
    })),
    paymentHistory,
    ledger,
    monthlyClosing,
    cyclesCompleted: billing.cyclesCompleted,
    billableMealCount: billing.billableMealCount,
    totalDue: billing.totalDue,
    totalPaid: billing.totalPaid,
    balance: billing.netBalance,
    dueAmount: billing.dueAmount,
    advanceAmount: billing.advanceAmount,
    historyMeta: {
      leaves: {
        page: leavesPage,
        limit: leavesLimit,
        total: leavesCount,
        totalPages: Math.max(1, Math.ceil(leavesCount / leavesLimit)),
      },
      bookings: {
        page: bookingsPage,
        limit: bookingsLimit,
        total: bookingsCount,
        totalPages: Math.max(1, Math.ceil(bookingsCount / bookingsLimit)),
      },
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  const user = await User.findOne({ _id: id, role: "CUSTOMER" }).lean();
  if (!user) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  try {
    const body = await req.json();
    const { name, phone, email, address, lat, lng, startDate, endDate, offerPrices } = body;
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = String(name).trim();
    if (phone !== undefined) update.phone = String(phone).trim();
    if (email !== undefined) {
      update.email = email === "" ? null : String(email).trim();
    }
    if (address !== undefined) {
      update.address = address === "" ? null : String(address).trim();
    }
    if (lat !== undefined) {
      update.lat = typeof lat === "number" ? lat : null;
    }
    if (lng !== undefined) {
      update.lng = typeof lng === "number" ? lng : null;
    }
    if (startDate !== undefined) {
      update.startDate =
        startDate === "" || startDate === null ? null : new Date(startDate);
    }
    if (endDate !== undefined) {
      update.endDate =
        endDate === "" || endDate === null ? null : new Date(endDate);
    }

    const coerceOffer = (v: unknown): number | null | undefined => {
      if (v === undefined) return undefined;
      if (v === null || v === "") return null;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n) || n < 0) return undefined;
      return n;
    };
    if (offerPrices !== undefined) {
      const op = offerPrices as {
        breakfast?: unknown;
        lunch?: unknown;
        dinner?: unknown;
      };
      const b = coerceOffer(op?.breakfast);
      const l = coerceOffer(op?.lunch);
      const d = coerceOffer(op?.dinner);
      if (b !== undefined) update.offerBreakfastPrice = b;
      if (l !== undefined) update.offerLunchPrice = l;
      if (d !== undefined) update.offerDinnerPrice = d;
    }
    if (Object.keys(update).length > 0) {
      await User.updateOne({ _id: id }, { $set: update });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
