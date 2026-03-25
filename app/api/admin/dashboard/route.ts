import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { connectDB } from "@/lib/mongodb";
import { User, Leave } from "@/lib/models";
import { dayRangeFilter } from "@/lib/dayRange";
import { addDays, format, startOfDay } from "date-fns";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const [subscribedCustomers, leavesToday, leavesTomorrow, allCustomers] =
    await Promise.all([
      User.find({ role: "CUSTOMER", startDate: { $ne: null } })
        .select({ _id: 1 })
        .lean(),
      Leave.find({ date: dayRangeFilter(today) })
        .select({ userId: 1, mealType: 1 })
        .lean(),
      Leave.find({ date: dayRangeFilter(tomorrow) })
        .select({ userId: 1, mealType: 1 })
        .lean(),
      User.find({ role: "CUSTOMER" })
        .select({ _id: 1, name: 1, startDate: 1 })
        .lean(),
    ]);

  const activeUserIds = new Set(subscribedCustomers.map((u) => u._id));
  const todayLeaveSet = new Set(leavesToday.map((l) => `${l.userId}:${l.mealType}`));
  const tomorrowLeaveSet = new Set(
    leavesTomorrow.map((l) => `${l.userId}:${l.mealType}`)
  );

  const countForMeal = (mealType: string, leaveSet: Set<string>) => {
    let n = 0;
    activeUserIds.forEach((uid) => {
      if (!leaveSet.has(`${uid}:${mealType}`)) n++;
    });
    return n;
  };

  const breakfast = countForMeal("BREAKFAST", todayLeaveSet);
  const lunch = countForMeal("LUNCH", todayLeaveSet);
  const dinner = countForMeal("DINNER", todayLeaveSet);
  const tomorrowBreakfast = countForMeal("BREAKFAST", tomorrowLeaveSet);
  const tomorrowLunch = countForMeal("LUNCH", tomorrowLeaveSet);
  const tomorrowDinner = countForMeal("DINNER", tomorrowLeaveSet);
  const activeCustomers = activeUserIds.size;

  const leaveSummary = allCustomers
    .filter((c) => c.startDate)
    .map((c) => {
      const b = todayLeaveSet.has(`${c._id}:BREAKFAST`);
      const l = todayLeaveSet.has(`${c._id}:LUNCH`);
      const d = todayLeaveSet.has(`${c._id}:DINNER`);
      if (!b && !l && !d) return null;
      return {
        customerId: c._id,
        name: c.name,
        B: b,
        L: l,
        D: d,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    breakfast,
    lunch,
    dinner,
    tomorrowBreakfast,
    tomorrowLunch,
    tomorrowDinner,
    todayLabel: format(today, "dd MMM yyyy"),
    tomorrowLabel: format(tomorrow, "dd MMM yyyy"),
    activeCustomers,
    leaveSummary,
  });
}
