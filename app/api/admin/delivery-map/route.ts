import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { nearestNeighborTSP, routeDistances } from "@/lib/delivery";
import { getSystemSettings } from "@/lib/system";
import { startOfDay } from "date-fns";
import { MealType } from "@/lib/constants";

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

  const [settings, subscribedUsers, leaves, bookings] = await Promise.all([
    getSystemSettings(),
    prisma.user.findMany({
      where: { role: "CUSTOMER", startDate: { not: null } },
      include: { locations: true },
    }),
    prisma.leave.findMany({
      where: { date, mealType: meal },
      select: { userId: true },
    }),
    prisma.dayBooking.findMany({
      where: { date, mealType: meal },
      select: { userId: true, deliveryLocationId: true },
    }),
  ]);
  const leaveUserIds = new Set(leaves.map((l) => l.userId));
  const bookingMap = new Map(bookings.map((booking) => [booking.userId, booking.deliveryLocationId]));

  const stops: { lat: number; lng: number; userId: string; name: string; address: string }[] = [];
  for (const u of subscribedUsers) {
    if (leaveUserIds.has(u.id)) continue;
    const bookedLocationId = bookingMap.get(u.id);
    const location =
      u.locations.find((l) => l.id === bookedLocationId) ??
      u.locations.find((l) => l.mealType === meal && l.isDefault) ??
      u.locations.find((l) => l.mealType === meal);
    if (location) {
      stops.push({
        lat: location.lat,
        lng: location.lng,
        userId: u.id,
        name: u.name,
        address: location.address,
      });
    }
  }

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
