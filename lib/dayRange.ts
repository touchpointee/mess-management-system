import { addDays, startOfDay } from "date-fns";

/** MongoDB filter for documents whose calendar day equals `date`. */
export function dayRangeFilter(date: Date) {
  const start = startOfDay(date);
  return { $gte: start, $lt: addDays(start, 1) };
}
