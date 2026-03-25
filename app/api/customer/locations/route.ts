import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { DeliveryLocation } from "@/lib/models";
import { MealType } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  const userId = token?.sub;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const locations = await DeliveryLocation.find({ userId })
    .sort({ mealType: 1, isDefault: -1 })
    .lean();
  return NextResponse.json(
    locations.map((l) => ({
      id: l._id,
      userId: l.userId,
      label: l.label,
      address: l.address,
      lat: l.lat,
      lng: l.lng,
      mealType: l.mealType,
      isDefault: l.isDefault,
    }))
  );
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  try {
    const body = await req.json();
    const { label, address, lat, lng, mealType, setAsDefault } = body as {
      label: string;
      address: string;
      lat: number;
      lng: number;
      mealType: string;
      setAsDefault?: boolean;
    };
    if (!label || !address || typeof lat !== "number" || typeof lng !== "number" || !mealType) {
      return NextResponse.json(
        { message: "label, address, lat, lng, mealType required" },
        { status: 400 }
      );
    }
    if (!(Object.values(MealType) as string[]).includes(mealType)) {
      return NextResponse.json({ message: "Invalid mealType" }, { status: 400 });
    }
    await connectDB();
    if (setAsDefault) {
      await DeliveryLocation.updateMany(
        { userId, mealType },
        { $set: { isDefault: false } }
      );
    }
    const loc = await DeliveryLocation.create({
      userId,
      label,
      address,
      lat,
      lng,
      mealType,
      isDefault: !!setAsDefault,
    });
    return NextResponse.json({
      id: loc._id,
      userId: loc.userId,
      label: loc.label,
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      mealType: loc.mealType,
      isDefault: loc.isDefault,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  try {
    const body = await req.json();
    const { id, setAsDefault } = body as { id: string; setAsDefault?: boolean };
    if (!id) {
      return NextResponse.json({ message: "id required" }, { status: 400 });
    }
    await connectDB();
    const loc = await DeliveryLocation.findOne({ _id: id, userId }).lean();
    if (!loc) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 });
    }
    if (setAsDefault) {
      await DeliveryLocation.updateMany(
        { userId, mealType: loc.mealType },
        { $set: { isDefault: false } }
      );
      await DeliveryLocation.updateOne({ _id: id }, { $set: { isDefault: true } });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "id query required" }, { status: 400 });
  }
  await connectDB();
  await DeliveryLocation.deleteMany({ _id: id, userId });
  return NextResponse.json({ success: true });
}
