"use client";

import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { isPastDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DAYS = 7;

type DateStripProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
};

export function DateStrip({ selectedDate, onSelect }: DateStripProps) {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(today, i));

  return (
    <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4 scrollbar-hide">
      {dates.map((date) => {
        const isPast = isPastDate(date);
        const selected = isSameDay(date, selectedDate);
        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => !isPast && onSelect(date)}
            disabled={isPast}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center w-14 py-3 rounded-xl border-2 transition-all duration-200",
              isPast && "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400",
              selected
                ? "border-[#C0392B] bg-[#FEF2F2] text-[#C0392B] font-bold scale-[1.05] shadow-sm"
                : !isPast && "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
            )}
          >
            <span className={cn(selected ? "text-xl" : "text-lg", selected && "font-bold")}>
              {format(date, "d")}
            </span>
            <span className={cn("text-xs mt-0.5", selected ? "font-semibold" : "font-medium")}>
              {format(date, "MMM")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
