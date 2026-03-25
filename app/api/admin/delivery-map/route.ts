import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, Leave, DayBooking, DeliveryLocation } from "@/lib/models";
import { nearestNeighborTSP, routeDistances } from "@/lib/delivery";
import { getSystemSettings } from "@/lib/system";
import { startOfDay } from "date-fns";
import { MealType } from "@/lib/constants";
import { dayRangeFilter } from "@/lib/dayRange";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const meal = searchParams.get("meal");
  const dateStr = searchParams.get("date");
  if (!meal || !dateStr) {
    return NextResponse.json(
      { message: "meal and date query required" },
      { status: 400 }
    );
  }
  if (!(Object.values(MealType) as string[]).includes(meal)) {
    return NextResponse.json({ message: "Invalid meal type" }, { status: 400 });
  }
  const date = startOfDay(new Date(dateStr));
  if (isNaN(date.getTime())) {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }

  await connectDB();
  const subscribedUsers = await User.find({
    role: "CUSTOMER",
    startDate: { $ne: null },
  }).lean();
  const userIds = subscribedUsers.map((u) => u._id);
  const [locationsByUser, leaves, bookings] = await Promise.all([
    DeliveryLocation.find({ userId: { $in: userIds } }).lean(),
    Leave.find({
      date: dayRangeFilter(date),
      mealType: meal,
    })
      .select({ userId: 1 })
      .lean(),
    DayBooking.find({
      date: dayRangeFilter(date),
      mealType: meal,
    })
      .select({ userId: 1, deliveryLocationId: 1 })
      .lean(),
  ]);

  const locMap = new Map<string, (typeof locationsByUser)[0][]>();
  for (const loc of locationsByUser) {
    const list = locMap.get(loc.userId) ?? [];
    list.push(loc);
    locMap.set(loc.userId, list);
  }

  const leaveUserIds = new Set(leaves.map((l) => l.userId));
  const bookingMap = new Map(bookings.map((booking) => [booking.userId, booking.deliveryLocationId]));

  const stops: { lat: number; lng: number; userId: string; name: string; address: string }[] = [];
  for (const u of subscribedUsers) {
    if (leaveUserIds.has(u._id)) continue;
    const bookedLocationId = bookingMap.get(u._id);
    const uLocations = locMap.get(u._id) ?? [];
    const location =
      uLocations.find((l) => l._id === bookedLocationId) ??
      uLocations.find((l) => l.mealType === meal && l.isDefault) ??
      uLocations.find((l) => l.mealType === meal);
    if (location) {
      stops.push({
        lat: location.lat,
        lng: location.lng,
        userId: u._id,
        name: u.name,
        address: location.address,
      });
    }
  }

  const settings = await getSystemSettings();
  const start = { lat: settings.lat, lng: settings.lng };
  const ordered = nearestNeighborTSP(start, stops);
  const { legKm, totalKm } = routeDistances(
    start,
    ordered.map((o) => ({ lat: o.lat, lng: o.lng }))
  );

  const route = ordered.map((stop, i) => ({
    customerId: stop.userId,
    name: stop.name,
    address: stop.address,
    lat: stop.lat,
    lng: stop.lng,
    stopNumber: i + 1,
    distanceFromPrev: i < legKm.length ? Math.round(legKm[i] * 1000) / 1000 : 0,
  }));

  return NextResponse.json({
    route,
    totalDistanceKm: Math.round(totalKm * 1000) / 1000,
    mess: {
      name: settings.businessName,
      address: [settings.address, settings.city].filter(Boolean).join(", "),
      lat: settings.lat,
      lng: settings.lng,
    },
  });
}
