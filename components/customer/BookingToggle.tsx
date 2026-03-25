"use client";

import { cn } from "@/lib/utils";

type BookingToggleProps = {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function BookingToggle({ on, onToggle, disabled }: BookingToggleProps) {
  return (
    <div className="bg-[#FEF2F2] rounded-[16px] p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[#C0392B]">Booking for the day</p>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={disabled}
          onClick={onToggle}
          className={cn(
            "relative w-12 h-7 rounded-full transition-colors flex-shrink-0",
            on ? "bg-[#C0392B]" : "bg-gray-300",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
              on ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}
