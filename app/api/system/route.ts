import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/system";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await getSystemSettings();
  return NextResponse.json(settings);
}

const isValidCoordinate = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

const isValidPrice = (value: number) => Number.isFinite(value) && value >= 0;

export async function PUT(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const businessName = String(body?.businessName ?? "").trim();
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);
    const breakfastPrice = Number(body?.breakfastPrice);
    const lunchPrice = Number(body?.lunchPrice);
    const dinnerPrice = Number(body?.dinnerPrice);
    if (!businessName) {
      return NextResponse.json(
        { message: "Mess name is required" },
        { status: 400 }
      );
    }
    if (!isValidCoordinate(lat, lng)) {
      return NextResponse.json(
        { message: "Valid latitude and longitude are required" },
        { status: 400 }
      );
    }
    if (
      !isValidPrice(breakfastPrice) ||
      !isValidPrice(lunchPrice) ||
      !isValidPrice(dinnerPrice)
    ) {
      return NextResponse.json(
        { message: "Valid non-negative meal prices are required" },
        { status: 400 }
      );
    }

    const current = await getSystemSettings();
    await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: { businessName, lat, lng, breakfastPrice, lunchPrice, dinnerPrice },
      create: {
        id: "default",
        businessName,
        shortName: current.shortName,
        phone: current.phone,
        supportEmail: current.supportEmail,
        address: current.address,
        city: current.city,
        heroImageUrl: current.heroImageUrl,
        lat,
        lng,
        breakfastPrice,
        lunchPrice,
        dinnerPrice,
      },
    });
    return NextResponse.json({
      success: true,
      businessName,
      lat,
      lng,
      breakfastPrice,
      lunchPrice,
      dinnerPrice,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
