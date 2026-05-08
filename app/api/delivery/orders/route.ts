import { NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { DeliveryOrder, User } from "@/lib/models";
import { DeliveryOrderStatus, MealType, Role } from "@/lib/constants";
import { dayRangeFilter } from "@/lib/dayRange";
import { getSystemSettings } from "@/lib/system";
import { routeDistances } from "@/lib/delivery";

function canUseDelivery(token: Awaited<ReturnType<typeof getAuthToken>>) {
  return token?.role === Role.DELIVERY_PARTNER || token?.role === Role.ADMIN;
}

async function ensureActiveDeliveryPartner(token: Awaited<ReturnType<typeof getAuthToken>>) {
  if (token?.role !== Role.DELIVERY_PARTNER || !token.sub) return true;
  const partner = await User.findOne({
    _id: token.sub,
    role: Role.DELIVERY_PARTNER,
    isActive: { $ne: false },
  })
    .select({ _id: 1 })
    .lean();
  return !!partner;
}

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!canUseDelivery(token) || !token?.sub) {
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
  if (!(await ensureActiveDeliveryPartner(token))) {
    return NextResponse.json({ message: "Account disabled" }, { status: 403 });
  }
  const filter: Record<string, unknown> = {
    date: dayRangeFilter(date),
    mealType: meal,
  };
  if (token.role === Role.DELIVERY_PARTNER) {
    filter.deliveryPartnerId = token.sub;
  }
  const orders = await DeliveryOrder.find(filter).sort({ stopNumber: 1 }).lean();
  const settings = await getSystemSettings();
  const start = { lat: settings.lat, lng: settings.lng };
  const { totalKm } = routeDistances(
    start,
    orders.map((order) => ({ lat: order.lat, lng: order.lng }))
  );

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order._id,
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone ?? null,
      address: order.address,
      lat: order.lat,
      lng: order.lng,
      stopNumber: order.stopNumber,
      distanceFromPrev: order.distanceFromPrev,
      status: order.status,
      deliveredAt: order.deliveredAt ?? null,
    })),
    totalDistanceKm: Math.round(totalKm * 1000) / 1000,
    mess: {
      name: settings.businessName,
      address: [settings.address, settings.city].filter(Boolean).join(", "),
      lat: settings.lat,
      lng: settings.lng,
    },
  });
}

export async function PATCH(req: Request) {
  const token = await getAuthToken(req);
  if (!canUseDelivery(token) || !token?.sub) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ message: "Order id required" }, { status: 400 });
    }

    await connectDB();
    if (!(await ensureActiveDeliveryPartner(token))) {
      return NextResponse.json({ message: "Account disabled" }, { status: 403 });
    }
    const filter: Record<string, unknown> = { _id: id };
    if (token.role === Role.DELIVERY_PARTNER) {
      filter.deliveryPartnerId = token.sub;
    }
    const order = await DeliveryOrder.findOneAndUpdate(
      filter,
      {
        $set: {
          status: DeliveryOrderStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id: order._id,
      status: order.status,
      deliveredAt: order.deliveredAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
