import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import { MealType } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ message: "date query required" }, { status: 400 });
  }
  const date = startOfDay(new Date(dateStr));
  if (isNaN(date.getTime())) {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }

  const [user, leaves, locations, bookings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    }),
    prisma.leave.findMany({
      where: { userId, date },
      select: { mealType: true },
    }),
    prisma.deliveryLocation.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }],
    }),
    prisma.dayBooking.findMany({
      where: { userId, date },
      select: { mealType: true, deliveryLocationId: true },
    }),
  ]);

  const hasActivePlan = !!user?.plan?.isActive;
  const leaveSet = new Set(leaves.map((l) => l.mealType));
  const bookingMap = new Map(
    bookings.map((b) => [b.mealType, b.deliveryLocationId])
  );

  const getLocation = (mealType: string) => {
    const bookId = bookingMap.get(mealType);
    if (bookId) {
      const loc = locations.find((l) => l.id === bookId);
      return loc ? { id: loc.id, label: loc.label, address: loc.address } : null;
    }
    const defaultLoc = locations.find(
      (l) => l.mealType === mealType && l.isDefault
    ) ?? locations.find((l) => l.mealType === mealType);
    return defaultLoc
      ? { id: defaultLoc.id, label: defaultLoc.label, address: defaultLoc.address }
      : null;
  };

  const result = {
    B: {
      active: hasActivePlan && !leaveSet.has(MealType.BREAKFAST),
      location: getLocation(MealType.BREAKFAST),
    },
    L: {
      active: hasActivePlan && !leaveSet.has(MealType.LUNCH),
      location: getLocation(MealType.LUNCH),
    },
    D: {
      active: hasActivePlan && !leaveSet.has(MealType.DINNER),
      location: getLocation(MealType.DINNER),
    },
  };
  return NextResponse.json(result);
}
