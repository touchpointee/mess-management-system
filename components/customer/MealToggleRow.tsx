"use client";

import { cn } from "@/lib/utils";

type MealToggleRowProps = {
  mealName: string;
  address: string | null;
  active: boolean;
  onToggle: () => void;
  onAddressClick: () => void;
  disabled?: boolean;
  isHoliday?: boolean;
};

function truncate(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

export function MealToggleRow({
  mealName,
  address,
  active,
  onToggle,
  onAddressClick,
  disabled,
  isHoliday,
}: MealToggleRowProps) {
  return (
    <div className="py-3.5 flex items-center justify-between border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-gray-500 text-sm">{mealName}</p>
        <button
          type="button"
          onClick={onAddressClick}
          className="text-left font-bold text-gray-900 truncate block w-full text-sm mt-0.5"
        >
          {address ? truncate(address, 30) : "Add location"}
        </button>
      </div>
      {isHoliday ? (
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-[#C0392B] border border-red-100 rounded-full flex-shrink-0">
          Holiday
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={active}
          disabled={disabled}
          onClick={onToggle}
          className={cn(
            "relative w-12 h-7 rounded-full transition-colors flex-shrink-0",
            active ? "bg-[#C0392B]" : "bg-gray-300",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
              active ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      )}
    </div>
  );
}
