import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfDay,
  isBefore,
  differenceInCalendarDays,
  addDays,
  startOfMonth,
  endOfMonth,
  getDay,
  format as fnsFormat,
} from "date-fns";
import { MealType } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPastDate(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = addDays(startOfDay(new Date()), 1);
  return differenceInCalendarDays(date, tomorrow) === 0;
}

export function daysBetween(from: Date, to: Date): number {
  return differenceInCalendarDays(startOfDay(to), startOfDay(from));
}

export function getCyclesCompleted(startDate: Date, asOf: Date): number {
  const days = daysBetween(startDate, asOf);
  return Math.max(0, Math.floor(days / 30));
}

type BillingMealPrices = {
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
};

type BillingMealBooking = {
  date: Date;
  mealType: string;
};

function getMealUnitPrice(mealType: string, prices: BillingMealPrices): number {
  if (mealType === MealType.BREAKFAST) return prices.breakfastPrice;
  if (mealType === MealType.LUNCH) return prices.lunchPrice;
  if (mealType === MealType.DINNER) return prices.dinnerPrice;
  return 0;
}

export function getBillingSummary(
  mealBookings: BillingMealBooking[],
  mealPrices: BillingMealPrices,
  paymentAmounts: number[],
  asOf: Date = new Date()
): {
  cyclesCompleted: number;
  totalDue: number;
  totalPaid: number;
  netBalance: number;
  dueAmount: number;
  advanceAmount: number;
} {
  const effectiveBookings = mealBookings.filter(
    (booking) => startOfDay(booking.date).getTime() <= startOfDay(asOf).getTime()
  );
  const totalDue = effectiveBookings.reduce(
    (sum, booking) => sum + getMealUnitPrice(booking.mealType, mealPrices),
    0
  );
  const totalPaid = paymentAmounts.reduce((sum, amount) => sum + amount, 0);
  const netBalance = totalDue - totalPaid;
  return {
    // Kept for API compatibility; now represents booked meal count.
    cyclesCompleted: effectiveBookings.length,
    totalDue,
    totalPaid,
    netBalance,
    dueAmount: Math.max(netBalance, 0),
    advanceAmount: Math.max(-netBalance, 0),
  };
}

export function getNextDueDate(startDate: Date): Date {
  const today = startOfDay(new Date());
  if (isBefore(today, startDate)) return startDate;
  const cycles = getCyclesCompleted(startDate, today);
  return addDays(startDate, (cycles + 1) * 30);
}

export function canEditMeal(date: Date): boolean {
  const today = new Date();
  const dayStart = startOfDay(date);
  const todayStart = startOfDay(today);
  if (isBefore(dayStart, todayStart)) return false;
  if (differenceInCalendarDays(dayStart, todayStart) === 0) return true;
  if (differenceInCalendarDays(dayStart, todayStart) === 1) {
    const hour = today.getHours();
    const minute = today.getMinutes();
    return hour < 22;
  }
  return true;
}

export function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: Date | string, pattern = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return fnsFormat(d, pattern);
}

export function getCalendarMonth(month: Date): {
  start: Date;
  end: Date;
  weeks: (Date | null)[][];
} {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const startDay = getDay(start);
  const daysInMonth = differenceInCalendarDays(end, start) + 1;
  const leadingBlanks = startDay;
  const totalCells = leadingBlanks + daysInMonth;
  const rows = Math.ceil(totalCells / 7);
  const weeks: (Date | null)[][] = [];
  let dayIndex = 0;
  for (let w = 0; w < rows; w++) {
    const week: (Date | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const cellIndex = w * 7 + d;
      if (cellIndex < leadingBlanks) {
        week.push(null);
      } else if (dayIndex < daysInMonth) {
        week.push(addDays(start, dayIndex));
        dayIndex++;
      } else {
        week.push(null);
      }
    }
    weeks.push(week);
  }
  return { start, end, weeks };
}

type LedgerPayment = {
  id: string;
  amount: number;
  date: Date;
  note?: string | null;
};

export type AccountLedgerEntry = {
  id: string;
  date: Date;
  type: "CHARGE" | "PAYMENT";
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
};

export type MonthlyClosingEntry = {
  monthKey: string;
  label: string;
  openingBalance: number;
  debit: number;
  credit: number;
  closingBalance: number;
};

export function buildLedgerAndMonthlyClosing(
  mealBookings: BillingMealBooking[],
  mealPrices: BillingMealPrices,
  payments: LedgerPayment[],
  asOf: Date = new Date()
): {
  ledger: AccountLedgerEntry[];
  monthlyClosing: MonthlyClosingEntry[];
} {
  const sortedPayments = [...payments].sort(
    (a, b) => startOfDay(a.date).getTime() - startOfDay(b.date).getTime()
  );

  const events: Omit<AccountLedgerEntry, "runningBalance">[] = [];

  const effectiveBookings = mealBookings
    .filter((booking) => startOfDay(booking.date).getTime() <= startOfDay(asOf).getTime())
    .sort((a, b) => startOfDay(a.date).getTime() - startOfDay(b.date).getTime());
  for (let i = 0; i < effectiveBookings.length; i++) {
    const booking = effectiveBookings[i];
    const amount = getMealUnitPrice(booking.mealType, mealPrices);
    const mealLabel = booking.mealType.charAt(0) + booking.mealType.slice(1).toLowerCase();
    events.push({
      id: `booking-charge-${i}-${startOfDay(booking.date).toISOString()}-${booking.mealType}`,
      date: startOfDay(booking.date),
      type: "CHARGE",
      description: `${mealLabel} booking charge`,
      debit: amount,
      credit: 0,
    });
  }

  for (const payment of sortedPayments) {
    events.push({
      id: payment.id,
      date: startOfDay(payment.date),
      type: "PAYMENT",
      description: payment.note?.trim() || "Payment received",
      debit: 0,
      credit: payment.amount,
    });
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  let running = 0;
  const ledger: AccountLedgerEntry[] = events.map((event) => {
    running += event.debit - event.credit;
    return {
      ...event,
      runningBalance: running,
    };
  });

  const grouped = new Map<
    string,
    { month: Date; debit: number; credit: number }
  >();

  for (const row of ledger) {
    const month = startOfMonth(row.date);
    const key = fnsFormat(month, "yyyy-MM");
    const current = grouped.get(key) ?? { month, debit: 0, credit: 0 };
    current.debit += row.debit;
    current.credit += row.credit;
    grouped.set(key, current);
  }

  const monthlyClosing: MonthlyClosingEntry[] = [];
  let opening = 0;
  for (const key of Array.from(grouped.keys()).sort()) {
    const value = grouped.get(key);
    if (!value) continue;
    const closing = opening + value.debit - value.credit;
    monthlyClosing.push({
      monthKey: key,
      label: fnsFormat(value.month, "MMM yyyy"),
      openingBalance: opening,
      debit: value.debit,
      credit: value.credit,
      closingBalance: closing,
    });
    opening = closing;
  }

  return { ledger, monthlyClosing };
}
