import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { canEditMeal } from "@/lib/utils";
import { MealType } from "@/lib/constants";

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  try {
    const body = await req.json();
    const { date, mealType, deliveryLocationId } = body as {
      date: string;
      mealType: string;
      deliveryLocationId: string;
    };
    if (!date || !mealType || !deliveryLocationId) {
      return NextResponse.json(
        { message: "date, mealType, deliveryLocationId required" },
        { status: 400 }
      );
    }
    if (!(Object.values(MealType) as string[]).includes(mealType)) {
      return NextResponse.json({ message: "Invalid mealType" }, { status: 400 });
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }
    if (!canEditMeal(d)) {
      return NextResponse.json(
        { message: "Cannot set booking for this date" },
        { status: 400 }
      );
    }
    const loc = await prisma.deliveryLocation.findFirst({
      where: { id: deliveryLocationId, userId },
    });
    if (!loc) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 });
    }
    await prisma.dayBooking.upsert({
      where: {
        userId_date_mealType: { userId, date: d, mealType },
      },
      create: { userId, date: d, mealType, deliveryLocationId },
      update: { deliveryLocationId },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
