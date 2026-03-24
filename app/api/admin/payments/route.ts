import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const payments = await prisma.payment.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { date: "desc" },
    include: { user: { select: { name: true, phone: true } } },
  });
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { userId, amount, date, note } = body as {
      userId: string;
      amount: number;
      date: string;
      note?: string;
    };
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { message: "userId and positive amount required" },
        { status: 400 }
      );
    }
    const d = date ? new Date(date) : new Date();
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        date: d,
        note: note?.trim() || null,
      },
    });
    return NextResponse.json(payment);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
