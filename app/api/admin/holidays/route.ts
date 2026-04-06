import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { MessHoliday } from "@/lib/models";
import { startOfDay } from "date-fns";
import { MealType } from "@/lib/constants";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  
  // Return all holidays in ascending order
  const holidays = await MessHoliday.find({})
    .sort({ date: -1 })
    .lean();
    
  return NextResponse.json(holidays.map(h => ({
    id: h._id,
    date: h.date,
    mealType: h.mealType,
    createdAt: h.createdAt,
  })));
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const { dates, mealType } = await req.json();
    if (!Array.isArray(dates) || dates.length === 0 || !mealType) {
      return NextResponse.json({ message: "dates array and mealType required" }, { status: 400 });
    }
    
    // validate meal type
    if (mealType !== "ALL" && mealType !== MealType.BREAKFAST && mealType !== MealType.LUNCH && mealType !== MealType.DINNER) {
      return NextResponse.json({ message: "invalid mealType" }, { status: 400 });
    }

    await connectDB();
    
    let addedCount = 0;
    for (const dateStr of dates) {
      const d = startOfDay(new Date(dateStr));
      if (isNaN(d.getTime())) continue;
      
      try {
        await MessHoliday.create({
          date: d,
          mealType: mealType,
        });
        addedCount++;
      } catch (err: any) {
        // Ignore duplicate key error (code 11000) for this date/meal slot
        if (err.code !== 11000) {
          throw err;
        }
      }
    }
    
    return NextResponse.json({ success: true, addedCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    await connectDB();
    await MessHoliday.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
