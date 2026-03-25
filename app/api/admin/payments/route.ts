import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { Payment, User } from "@/lib/models";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  await connectDB();
  const filter = userId ? { userId } : {};
  const payments = await Payment.find(filter).sort({ date: -1 }).lean();
  const userIds = Array.from(new Set(payments.map((p) => p.userId)));
  const users = await User.find({ _id: { $in: userIds } })
    .select({ name: 1, phone: 1 })
    .lean();
  const userMap = new Map(users.map((u) => [u._id, u]));
  const out = payments.map((p) => {
    const u = userMap.get(p.userId);
    return {
      id: p._id,
      userId: p.userId,
      amount: p.amount,
      date: p.date,
      note: p.note,
      createdAt: p.createdAt,
      user: u ? { name: u.name, phone: u.phone } : { name: "", phone: "" },
    };
  });
  return NextResponse.json(out);
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
    await connectDB();
    const payment = await Payment.create({
      userId,
      amount,
      date: d,
      note: note?.trim() || null,
    });
    return NextResponse.json({
      id: payment._id,
      userId: payment.userId,
      amount: payment.amount,
      date: payment.date,
      note: payment.note,
      createdAt: payment.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
