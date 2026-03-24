"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, addMonths, subMonths } from "date-fns";
import { getCalendarMonth, isPastDate, canEditMeal } from "@/lib/utils";
import { MealType } from "@/lib/constants";

type DayLeaves = { B: boolean; L: boolean; D: boolean };

export default function OverviewPage() {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [leavesMap, setLeavesMap] = useState<Record<string, DayLeaves>>({});
  const [quickDate, setQuickDate] = useState<Date | null>(null);
  const [quickLeaves, setQuickLeaves] = useState<DayLeaves | null>(null);
  const [saving, setSaving] = useState(false);

  const { weeks } = getCalendarMonth(month);
  const monthKey = format(month, "yyyy-MM");

  useEffect(() => {
    const rangeStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const rangeEnd = addMonths(rangeStart, 1);
    const reqDates: string[] = [];
    const cur = new Date(rangeStart);
    while (cur < rangeEnd) {
      reqDates.push(format(cur, "yyyy-MM-dd"));
      cur.setDate(cur.getDate() + 1);
    }
    Promise.all(
      reqDates.map((dateStr) =>
        fetch(`/api/customer/meals?date=${dateStr}`).then((r) => r.json())
      )
    ).then((results) => {
      const map: Record<string, DayLeaves> = {};
      reqDates.forEach((dateStr, i) => {
        const m = results[i];
        map[dateStr] = {
          B: !m?.B?.active,
          L: !m?.L?.active,
          D: !m?.D?.active,
        };
      });
      setLeavesMap(map);
    });
  }, [monthKey]);

  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    if (isPastDate(date)) return;
    const dateStr = format(date, "yyyy-MM-dd");
    setQuickDate(date);
    setQuickLeaves(leavesMap[dateStr] ?? { B: false, L: false, D: false });
  };

  const saveQuickLeave = async () => {
    if (!quickDate) return;
    const dateStr = format(quickDate, "yyyy-MM-dd");
    if (!canEditMeal(quickDate)) return;
    setSaving(true);
    try {
      const meals: string[] = [];
      if (quickLeaves?.B) meals.push(MealType.BREAKFAST);
      if (quickLeaves?.L) meals.push(MealType.LUNCH);
      if (quickLeaves?.D) meals.push(MealType.DINNER);
      if (meals.length > 0) {
        await fetch("/api/customer/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: [dateStr], meals }),
        });
      }
      const toRemove: string[] = [];
      if (!quickLeaves?.B) toRemove.push(MealType.BREAKFAST);
      if (!quickLeaves?.L) toRemove.push(MealType.LUNCH);
      if (!quickLeaves?.D) toRemove.push(MealType.DINNER);
      for (const meal of toRemove) {
        await fetch("/api/customer/leave", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr, meal }),
        });
      }
      setLeavesMap((prev) => ({
        ...prev,
        [dateStr]: quickLeaves ?? { B: false, L: false, D: false },
      }));
      setQuickDate(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <button
            type="button"
            onClick={() => setMonth(subMonths(month, 1))}
            className="p-2 text-[#C0392B] font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            ← Prev
          </button>
          <h1 className="font-bold text-lg text-gray-900">{format(month, "MMMM yyyy")}</h1>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            className="p-2 text-[#C0392B] font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            Next →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 text-sm bg-gray-50">
              <th className="p-3 font-semibold">Sun</th>
              <th className="p-3 font-semibold">Mon</th>
              <th className="p-3 font-semibold">Tue</th>
              <th className="p-3 font-semibold">Wed</th>
              <th className="p-3 font-semibold">Thu</th>
              <th className="p-3 font-semibold">Fri</th>
              <th className="p-3 font-semibold">Sat</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  const dateStr = day ? format(day, "yyyy-MM-dd") : "";
                  const leaves = dateStr ? leavesMap[dateStr] : null;
                  const past = day ? isPastDate(day) : true;
                  const fullLeave = leaves && leaves.B && leaves.L && leaves.D;
                  return (
                    <td key={di} className="p-1 align-top">
                      {day ? (
                        <button
                          type="button"
                          onClick={() => handleDayClick(day)}
                          disabled={past}
                          className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-200 ${
                            past 
                              ? "text-gray-300 bg-gray-50 cursor-not-allowed" 
                              : "text-gray-900 bg-white hover:bg-gray-50 hover:shadow-md cursor-pointer"
                          } ${fullLeave ? "ring-2 ring-red-300 bg-red-50" : ""}`}
                        >
                          <span className="font-medium">{format(day, "d")}</span>
                          {!past && leaves && (
                            <div className="flex gap-0.5 mt-1">
                              {!leaves.B && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                              {!leaves.L && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                              {!leaves.D && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                              {fullLeave && <span className="text-red-500 text-xs font-bold">✕</span>}
                            </div>
                          )}
                        </button>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-4 text-sm text-gray-600 bg-white rounded-xl p-4 shadow-card">
        <span className="flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Breakfast</span>
        <span className="flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" /> Lunch</span>
        <span className="flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" /> Dinner</span>
        <span className="flex items-center gap-2"><span className="text-red-500 font-bold">✕</span> Full leave</span>
      </div>
      {quickDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setQuickDate(null)} 
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Leave for {format(quickDate, "dd MMM")}</h3>
              <button
                onClick={() => setQuickDate(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {canEditMeal(quickDate) ? (
              <>
                <div className="space-y-3">
                  {(["B", "L", "D"] as const).map((k) => (
                    <label 
                      key={k} 
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={quickLeaves?.[k] ?? false}
                        onChange={() =>
                          setQuickLeaves((prev) => ({
                            ...prev!,
                            [k]: !prev?.[k],
                          }))
                        }
                        className="w-5 h-5 rounded border-gray-300 text-[#C0392B] focus:ring-[#C0392B]"
                      />
                      <span className="font-medium text-gray-700">
                        {k === "B" ? "Breakfast" : k === "L" ? "Lunch" : "Dinner"}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setQuickDate(null)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveQuickLeave}
                    disabled={saving}
                    className="flex-1 py-3 gradient-primary text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">This date cannot be edited.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
