import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { DeliveryOrder, User } from "@/lib/models";
import {
  ApprovalStatus,
  DeliveryOrderStatus,
  MealType,
  Role,
} from "@/lib/constants";
import { buildDeliveryRoute } from "@/lib/deliveryRoute";
import { dayRangeFilter } from "@/lib/dayRange";

function serializePartner(user: any, activeOrders = 0) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email ?? null,
    isActive: user.isActive !== false,
    createdAt: user.createdAt ?? null,
    activeOrders,
  };
}

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const partners = await User.find({ role: Role.DELIVERY_PARTNER })
    .sort({ createdAt: -1 })
    .lean();
  const partnerIds = partners.map((partner) => partner._id);
  const activeCounts = partnerIds.length
    ? await DeliveryOrder.aggregate([
        {
          $match: {
            deliveryPartnerId: { $in: partnerIds },
            status: DeliveryOrderStatus.ASSIGNED,
          },
        },
        { $group: { _id: "$deliveryPartnerId", count: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(activeCounts.map((row) => [row._id, row.count]));

  return NextResponse.json(
    partners.map((partner) =>
      serializePartner(partner, countMap.get(partner._id) ?? 0)
    )
  );
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, password } = body as {
      name?: string;
      phone?: string;
      email?: string;
      password?: string;
    };
    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: "Name, phone and password are required." },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await User.findOne({
      $or: [
        { phone: phone.trim() },
        ...(email ? [{ email: email.trim() }] : []),
      ],
    }).lean();
    if (existing) {
      return NextResponse.json(
        { message: "Phone or email already exists." },
        { status: 400 }
      );
    }

    const user = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      password: await hash(password, 12),
      role: Role.DELIVERY_PARTNER,
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
      approvedAt: new Date(),
      approvedBy: token.sub ?? null,
    });

    return NextResponse.json(serializePartner(user));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, isActive } = body as { id?: string; isActive?: boolean };
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "Partner id and active status are required." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { _id: id, role: Role.DELIVERY_PARTNER },
      { $set: { isActive } },
      { new: true }
    ).lean();
    if (!user) {
      return NextResponse.json({ message: "Partner not found." }, { status: 404 });
    }

    return NextResponse.json(serializePartner(user));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { partnerId, mealType, date } = body as {
      partnerId?: string;
      mealType?: string;
      date?: string;
    };
    if (!partnerId || !mealType || !date) {
      return NextResponse.json(
        { message: "Partner, meal and date are required." },
        { status: 400 }
      );
    }
    if (!(Object.values(MealType) as string[]).includes(mealType)) {
      return NextResponse.json({ message: "Invalid meal type." }, { status: 400 });
    }

    await connectDB();
    const partner = await User.findOne({
      _id: partnerId,
      role: Role.DELIVERY_PARTNER,
      isActive: { $ne: false },
    }).lean();
    if (!partner) {
      return NextResponse.json(
        { message: "Active delivery partner not found." },
        { status: 404 }
      );
    }

    const built = await buildDeliveryRoute(mealType, date);
    const now = new Date();
    const writes = built.route.map((stop) => ({
      updateOne: {
        filter: {
          date: dayRangeFilter(built.date),
          mealType,
          customerId: stop.customerId,
        },
        update: {
          $set: {
            date: built.date,
            mealType,
            customerId: stop.customerId,
            customerName: stop.customerName,
            customerPhone: stop.customerPhone,
            address: stop.address,
            lat: stop.lat,
            lng: stop.lng,
            deliveryPartnerId: partnerId,
            stopNumber: stop.stopNumber,
            distanceFromPrev: stop.distanceFromPrev,
            assignedAt: now,
            status: DeliveryOrderStatus.ASSIGNED,
            deliveredAt: null,
          },
        },
        upsert: true,
      },
    }));

    if (writes.length) {
      await DeliveryOrder.bulkWrite(writes);
    }

    return NextResponse.json({
      success: true,
      assignedCount: built.route.length,
      partnerId,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
