import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/getToken";
import { prisma } from "@/lib/prisma";
import { addDays, format, startOfDay } from "date-fns";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const [activePlans, leavesToday, leavesTomorrow, allCustomers] = await Promise.all([
    prisma.plan.findMany({
      where: { isActive: true },
      select: { userId: true },
    }),
    prisma.leave.findMany({
      where: { date: today },
      select: { userId: true, mealType: true },
    }),
    prisma.leave.findMany({
      where: { date: tomorrow },
      select: { userId: true, mealType: true },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: { plan: true },
    }),
  ]);

  const activeUserIds = new Set(activePlans.map((p) => p.userId));
  const todayLeaveSet = new Set(leavesToday.map((l) => `${l.userId}:${l.mealType}`));
  const tomorrowLeaveSet = new Set(leavesTomorrow.map((l) => `${l.userId}:${l.mealType}`));

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
    .filter((c) => c.plan?.isActive)
    .map((c) => {
      const b = todayLeaveSet.has(`${c.id}:BREAKFAST`);
      const l = todayLeaveSet.has(`${c.id}:LUNCH`);
      const d = todayLeaveSet.has(`${c.id}:DINNER`);
      if (!b && !l && !d) return null;
      return {
        customerId: c.id,
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
