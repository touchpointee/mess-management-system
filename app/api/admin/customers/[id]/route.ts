import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { buildLedgerAndMonthlyClosing, getBillingSummary } from "@/lib/utils";

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
  const user = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    include: {
      payments: { orderBy: { date: "asc" } },
      locations: true,
      leaves: {
        skip: (leavesPage - 1) * leavesLimit,
        take: leavesLimit,
        orderBy: { date: "desc" },
      },
      bookings: {
        skip: (bookingsPage - 1) * bookingsLimit,
        take: bookingsLimit,
        orderBy: { date: "desc" },
      },
    },
  });
  if (!user) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  const [leavesCount, bookingsCount, allLeaves, allBookings] = await Promise.all([
    prisma.leave.count({ where: { userId: id } }),
    prisma.dayBooking.count({ where: { userId: id } }),
    prisma.leave.findMany({
      where: { userId: id },
      select: { date: true, mealType: true },
    }),
    prisma.dayBooking.findMany({
      where: { userId: id },
      select: { date: true, mealType: true },
    }),
  ]);
  const today = new Date();
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" },
    select: { breakfastPrice: true, lunchPrice: true, dinnerPrice: true },
  });
  const mealPrices = {
    breakfastPrice: settings?.breakfastPrice ?? 0,
    lunchPrice: settings?.lunchPrice ?? 0,
    dinnerPrice: settings?.dinnerPrice ?? 0,
  };
  const billingStart = user.startDate ? new Date(user.startDate) : null;
  const billing = getBillingSummary(
    billingStart,
    allBookings.map((booking) => ({
      date: booking.date,
      mealType: booking.mealType,
    })),
    allLeaves.map((l) => ({ date: l.date, mealType: l.mealType })),
    mealPrices,
    user.payments.map((payment) => payment.amount),
    today
  );
  const { ledger, monthlyClosing } = buildLedgerAndMonthlyClosing(
    billingStart,
    allBookings.map((booking) => ({
      date: booking.date,
      mealType: booking.mealType,
    })),
    allLeaves.map((l) => ({ date: l.date, mealType: l.mealType })),
    mealPrices,
    user.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      date: payment.date,
      note: payment.note,
    })),
    today
  );
  const paymentRunningById = new Map(
    ledger.filter((l) => l.type === "PAYMENT").map((l) => [l.id, l.runningBalance])
  );
  const paymentHistory = user.payments.map((p) => {
    return {
      id: p.id,
      date: p.date,
      amount: p.amount,
      note: p.note,
      runningBalance: paymentRunningById.get(p.id) ?? 0,
    };
  });
  return NextResponse.json({
    ...user,
    password: undefined,
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
  const user = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
  });
  if (!user) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  try {
    const body = await req.json();
    const { name, phone, email, address, lat, lng, startDate } = body;
    if (name !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { name: String(name).trim() },
      });
    }
    if (phone !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { phone: String(phone).trim() },
      });
    }
    if (email !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { email: email === "" ? null : String(email).trim() },
      });
    }
    if (address !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { address: address === "" ? null : String(address).trim() },
      });
    }
    if (lat !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { lat: typeof lat === "number" ? lat : null },
      });
    }
    if (lng !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { lng: typeof lng === "number" ? lng : null },
      });
    }
    if (startDate !== undefined) {
      await prisma.user.update({
        where: { id },
        data: {
          startDate: startDate === "" || startDate === null ? null : new Date(startDate),
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
