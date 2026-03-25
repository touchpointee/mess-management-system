import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/system";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { SystemSettings } from "@/lib/models";

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
    const address = String(body?.address ?? "").trim();
    const city = String(body?.city ?? "").trim();
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
    if (!address) {
      return NextResponse.json(
        { message: "Address is required" },
        { status: 400 }
      );
    }
    if (!city) {
      return NextResponse.json(
        { message: "City is required" },
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
    await connectDB();
    await SystemSettings.findOneAndUpdate(
      { _id: "default" },
      {
        $set: {
          businessName,
          address,
          city,
          lat,
          lng,
          breakfastPrice,
          lunchPrice,
          dinnerPrice,
        },
        $setOnInsert: {
          _id: "default",
          shortName: current.shortName,
          phone: current.phone,
          supportEmail: current.supportEmail,
          heroImageUrl: current.heroImageUrl,
        },
      },
      { upsert: true }
    );
    return NextResponse.json({
      success: true,
      businessName,
      address,
      city,
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
