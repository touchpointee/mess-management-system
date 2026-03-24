import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { daysBetween, getBillingSummary } from "@/lib/utils";
import { Role } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const customers = await prisma.user.findMany({
    where: { role: Role.CUSTOMER },
    include: {
      plan: true,
      payments: true,
      bookings: {
        select: { date: true, mealType: true },
      },
    },
  });
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
  const list = customers.map((c) => {
    const plan = c.plan;
    const startDate = plan?.startDate ? new Date(plan.startDate) : null;
    const billing = getBillingSummary(
      c.bookings.map((booking) => ({
        date: booking.date,
        mealType: booking.mealType,
      })),
      mealPrices,
      c.payments.map((payment) => payment.amount),
      today
    );
    const daysActive = startDate ? daysBetween(startDate, today) : 0;
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      planFee: plan?.monthlyFee ?? null,
      startDate: plan?.startDate ?? null,
      daysActive,
      balanceDue: billing.netBalance,
      dueAmount: billing.dueAmount,
      advanceAmount: billing.advanceAmount,
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
      monthlyFee,
      startDate,
    } = body as {
      name: string;
      phone: string;
      email?: string;
      password: string;
      address?: string;
      lat?: number;
      lng?: number;
      monthlyFee?: number;
      startDate?: string;
    };
    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: "name, phone, password required" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Phone or email already exists" },
        { status: 400 }
      );
    }
    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        password: hashed,
        role: Role.CUSTOMER,
        address: address?.trim() || null,
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
      },
    });
    if (
      typeof monthlyFee === "number" &&
      monthlyFee > 0 &&
      startDate
    ) {
      await prisma.plan.create({
        data: {
          userId: user.id,
          monthlyFee,
          startDate: new Date(startDate),
          isActive: true,
        },
      });
    }
    return NextResponse.json({ success: true, id: user.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
