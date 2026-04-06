import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, Leave, DeliveryLocation, DayBooking, MessHoliday } from "@/lib/models";
import { startOfDay } from "date-fns";
import { MealType } from "@/lib/constants";
import { dayRangeFilter } from "@/lib/dayRange";

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

  await connectDB();
  const [user, leaves, locations, bookings, holidays] = await Promise.all([
    User.findById(userId).select({ startDate: 1 }).lean(),
    Leave.find({ userId, date: dayRangeFilter(date) }).select({ mealType: 1 }).lean(),
    DeliveryLocation.find({ userId }).sort({ isDefault: -1 }).lean(),
    DayBooking.find({ userId, date: dayRangeFilter(date) })
      .select({ mealType: 1, deliveryLocationId: 1 })
      .lean(),
    MessHoliday.find({ date: dayRangeFilter(date) }).lean()
  ]);

  const billingStart = user?.startDate ? startOfDay(new Date(user.startDate)) : null;
  const onOrAfterStart =
    billingStart === null || startOfDay(date).getTime() >= billingStart.getTime();

  const leaveSet = new Set(leaves.map((l) => l.mealType));
  const bookingMap = new Map(
    bookings.map((b) => [b.mealType, b.deliveryLocationId])
  );

  const getLocation = (mealType: string) => {
    const bookId = bookingMap.get(mealType);
    if (bookId) {
      const loc = locations.find((l) => l._id === bookId);
      return loc ? { id: loc._id, label: loc.label, address: loc.address } : null;
    }
    const defaultLoc =
      locations.find((l) => l.mealType === mealType && l.isDefault) ??
      locations.find((l) => l.mealType === mealType);
    return defaultLoc
      ? { id: defaultLoc._id, label: defaultLoc.label, address: defaultLoc.address }
      : null;
  };

  const isHoliday = (mt: string) => {
    return holidays.some(h => (h as any).mealType === "ALL" || (h as any).mealType === mt);
  };

  const result = {
    B: {
      active: onOrAfterStart && !leaveSet.has(MealType.BREAKFAST) && !isHoliday(MealType.BREAKFAST),
      isLeave: leaveSet.has(MealType.BREAKFAST),
      isHoliday: isHoliday(MealType.BREAKFAST),
      location: getLocation(MealType.BREAKFAST),
    },
    L: {
      active: onOrAfterStart && !leaveSet.has(MealType.LUNCH) && !isHoliday(MealType.LUNCH),
      isLeave: leaveSet.has(MealType.LUNCH),
      isHoliday: isHoliday(MealType.LUNCH),
      location: getLocation(MealType.LUNCH),
    },
    D: {
      active: onOrAfterStart && !leaveSet.has(MealType.DINNER) && !isHoliday(MealType.DINNER),
      isLeave: leaveSet.has(MealType.DINNER),
      isHoliday: isHoliday(MealType.DINNER),
      location: getLocation(MealType.DINNER),
    },
  };
  return NextResponse.json(result);
}
