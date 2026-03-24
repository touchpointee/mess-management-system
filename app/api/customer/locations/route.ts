import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { MealType } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  const userId = token?.sub;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const locations = await prisma.deliveryLocation.findMany({
    where: { userId },
    orderBy: [{ mealType: "asc" }, { isDefault: "desc" }],
  });
  return NextResponse.json(locations);
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
    if (setAsDefault) {
      await prisma.deliveryLocation.updateMany({
        where: { userId, mealType },
        data: { isDefault: false },
      });
    }
    const loc = await prisma.deliveryLocation.create({
      data: {
        userId,
        label,
        address,
        lat,
        lng,
        mealType,
        isDefault: !!setAsDefault,
      },
    });
    return NextResponse.json(loc);
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
    const loc = await prisma.deliveryLocation.findFirst({
      where: { id, userId },
    });
    if (!loc) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 });
    }
    if (setAsDefault) {
      await prisma.deliveryLocation.updateMany({
        where: { userId, mealType: loc.mealType },
        data: { isDefault: false },
      });
      await prisma.deliveryLocation.update({
        where: { id },
        data: { isDefault: true },
      });
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
  await prisma.deliveryLocation.deleteMany({
    where: { id, userId },
  });
  return NextResponse.json({ success: true });
}
