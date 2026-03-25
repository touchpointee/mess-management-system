import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { Leave } from "@/lib/models";
import { canEditMeal } from "@/lib/utils";
import { MealType } from "@/lib/constants";
import { startOfDay } from "date-fns";

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = token.sub;
  try {
    const body = await req.json();
    const { dates, meals } = body as { dates: string[]; meals: string[] };
    if (!Array.isArray(dates) || !Array.isArray(meals) || dates.length === 0 || meals.length === 0) {
      return NextResponse.json(
        { message: "dates and meals arrays required" },
        { status: 400 }
      );
    }
    const validMeals = Object.values(MealType);
    const mealSet = new Set(meals.filter((m: string) => (validMeals as string[]).includes(m)));
    if (mealSet.size === 0) {
      return NextResponse.json({ message: "No valid meal types" }, { status: 400 });
    }
    let count = 0;
    await connectDB();
    for (const dateStr of dates) {
      const date = startOfDay(new Date(dateStr));
      if (isNaN(date.getTime())) continue;
      if (!canEditMeal(date)) {
        return NextResponse.json(
          { message: "Cannot mark leave for this date (past or tomorrow after 10 PM)" },
          { status: 400 }
        );
      }
      for (const meal of Array.from(mealSet)) {
        await Leave.findOneAndUpdate(
          { userId, date, mealType: meal },
          { $setOnInsert: { userId, date, mealType: meal } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        count++;
      }
    }
    return NextResponse.json({ success: true, count });
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
  try {
    const body = await req.json();
    const { date, meal } = body as { date: string; meal: string };
    if (!date || !meal) {
      return NextResponse.json(
        { message: "date and meal required" },
        { status: 400 }
      );
    }
    const d = startOfDay(new Date(date));
    if (isNaN(d.getTime())) {
      return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }
    if (!canEditMeal(d)) {
      return NextResponse.json(
        { message: "Cannot change leave for this date" },
        { status: 400 }
      );
    }
    await connectDB();
    await Leave.deleteMany({
      userId,
      date: d,
      mealType: meal,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
