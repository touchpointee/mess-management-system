import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { MealType, Role } from "@/lib/constants";
import { buildDeliveryRoute } from "@/lib/deliveryRoute";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== Role.ADMIN) {
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

  await connectDB();
  try {
    return NextResponse.json(await buildDeliveryRoute(meal, dateStr));
  } catch {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }
}
