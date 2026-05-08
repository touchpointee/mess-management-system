import { startOfDay } from "date-fns";
import { DayBooking, DeliveryLocation, Leave, User } from "@/lib/models";
import { dayRangeFilter } from "@/lib/dayRange";
import { nearestNeighborTSP, routeDistances } from "@/lib/delivery";
import { getSystemSettings } from "@/lib/system";
import { ApprovalStatus, Role } from "@/lib/constants";

export type DeliveryRouteStop = {
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  address: string;
  lat: number;
  lng: number;
  stopNumber: number;
  distanceFromPrev: number;
};

export async function buildDeliveryRoute(meal: string, dateInput: string | Date) {
  const date = startOfDay(new Date(dateInput));
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const subscribedUsers = await User.find({
    role: Role.CUSTOMER,
    startDate: { $ne: null },
    $or: [
      { approvalStatus: ApprovalStatus.APPROVED },
      { approvalStatus: { $exists: false } },
    ],
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
  const bookingMap = new Map(
    bookings.map((booking) => [booking.userId, booking.deliveryLocationId])
  );

  const stops: {
    lat: number;
    lng: number;
    userId: string;
    name: string;
    phone: string | null;
    address: string;
  }[] = [];

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
        phone: u.phone ?? null,
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

  return {
    date,
    route: ordered.map((stop, i) => ({
      customerId: stop.userId,
      customerName: stop.name,
      customerPhone: stop.phone,
      name: stop.name,
      address: stop.address,
      lat: stop.lat,
      lng: stop.lng,
      stopNumber: i + 1,
      distanceFromPrev:
        i < legKm.length ? Math.round(legKm[i] * 1000) / 1000 : 0,
    })),
    totalDistanceKm: Math.round(totalKm * 1000) / 1000,
    mess: {
      name: settings.businessName,
      address: [settings.address, settings.city].filter(Boolean).join(", "),
      lat: settings.lat,
      lng: settings.lng,
    },
  };
}
