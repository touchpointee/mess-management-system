"use client";

import { useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { MealType } from "@/lib/constants";
import { canEditMeal } from "@/lib/utils";

type LeaveRangeModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (dates: string[], meals: string[]) => Promise<void>;
};

const MEALS = [
  { value: MealType.BREAKFAST, label: "Breakfast" },
  { value: MealType.LUNCH, label: "Lunch" },
  { value: MealType.DINNER, label: "Dinner" },
];

export function LeaveRangeModal({
  open,
  onClose,
  onConfirm,
}: LeaveRangeModalProps) {
  const today = startOfDay(new Date());
  const [from, setFrom] = useState(format(addDays(today, 1), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(addDays(today, 1), "yyyy-MM-dd"));
  const [meals, setMeals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMeal = (meal: string) => {
    setMeals((prev) => {
      const next = new Set(prev);
      if (next.has(meal)) next.delete(meal);
      else next.add(meal);
      return next;
    });
  }

  const handleSubmit = async () => {
    if (meals.size === 0) {
      setError("Select at least one meal");
      return;
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (fromDate > toDate) {
      setError("From date must be before or equal to To date");
      return;
    }
    const dates: string[] = [];
    let d = fromDate;
    while (d <= toDate) {
      if (canEditMeal(d)) {
        dates.push(format(d, "yyyy-MM-dd"));
      }
      d = addDays(d, 1);
    }
    if (dates.length === 0) {
      setError("No valid dates in range");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onConfirm(dates, Array.from(meals));
      onClose();
      setMeals(new Set());
    } catch {
      setError("Failed to mark leave");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-[430px] mx-auto max-h-[90vh] overflow-auto shadow-xl p-6">
        <h3 className="font-semibold text-lg mb-4">Mark Leave</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From date
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To date
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Meals</p>
            <div className="flex flex-wrap gap-4">
              {MEALS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meals.has(value)}
                    onChange={() => toggleMeal(value)}
                    className="rounded border-gray-300"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-[#C0392B] text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Mark Leave"}
          </button>
        </div>
      </div>
    </div>
  );
}
