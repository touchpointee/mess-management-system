"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, startOfDay, addDays } from "date-fns";
import { DateStrip } from "@/components/customer/DateStrip";
import { BookingToggle } from "@/components/customer/BookingToggle";
import { MealToggleRow } from "@/components/customer/MealToggleRow";
import { MessHeroCard } from "@/components/customer/MessHeroCard";
import { LocationPicker, type LocationItem } from "@/components/customer/LocationPicker";
import { LeaveRangeModal } from "@/components/customer/LeaveRangeModal";
import { MealType } from "@/lib/constants";
import { canEditMeal } from "@/lib/utils";

type MealState = {
  active: boolean;
  location: { id: string; label: string; address: string } | null;
};

type MealsData = {
  B: MealState;
  L: MealState;
  D: MealState;
};

const today = startOfDay(new Date());

export default function MyMessPage() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [meals, setMeals] = useState<MealsData | null>(null);
  const [tomorrowMeals, setTomorrowMeals] = useState<MealsData | null>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationPickerMeal, setLocationPickerMeal] = useState<string | null>(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [bookingOn, setBookingOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const editable = canEditMeal(selectedDate);

  const fetchMeals = useCallback(() => {
    fetch(`/api/customer/meals?date=${dateStr}`)
      .then((r) => r.json())
      .then(setMeals);
  }, [dateStr]);

  const fetchTomorrowMeals = useCallback(() => {
    fetch(`/api/customer/meals?date=${tomorrowStr}`)
      .then((r) => r.json())
      .then(setTomorrowMeals);
  }, [tomorrowStr]);

  const fetchLocations = useCallback(() => {
    fetch("/api/customer/locations")
      .then((r) => r.json())
      .then((data) =>
        setLocations(
          data.map((l: { id: string; label: string; address: string; mealType: string; isDefault: boolean }) => ({
            id: l.id,
            label: l.label,
            address: l.address,
            mealType: l.mealType,
            isDefault: l.isDefault,
          }))
        )
      );
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  useEffect(() => {
    fetchTomorrowMeals();
  }, [fetchTomorrowMeals]);

  useEffect(() => {
    if (meals) {
      setBookingOn(meals.B.active || meals.L.active || meals.D.active);
    }
  }, [meals]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const toggleBooking = async () => {
    if (!editable) return;
    setError(null);
    const next = !bookingOn;
    try {
      if (next) {
        await Promise.all([
          fetch("/api/customer/leave", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dateStr, meal: MealType.BREAKFAST }),
          }),
          fetch("/api/customer/leave", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dateStr, meal: MealType.LUNCH }),
          }),
          fetch("/api/customer/leave", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dateStr, meal: MealType.DINNER }),
          }),
        ]);
      } else {
        const res = await fetch("/api/customer/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dates: [dateStr],
            meals: [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER],
          }),
        });
        if (!res.ok) throw new Error("Unable to update booking");
      }
    } catch {
      setError("Could not update booking right now.");
      return;
    }
    setBookingOn(next);
    fetchMeals();
    fetchTomorrowMeals();
  };

  const toggleMeal = async (meal: string) => {
    if (!editable || !meals) return;
    setError(null);
    const key = meal === MealType.BREAKFAST ? "B" : meal === MealType.LUNCH ? "L" : "D";
    const current = meals[key].active;
    try {
      if (current) {
        await fetch("/api/customer/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: [dateStr], meals: [meal] }),
        });
      } else {
        await fetch("/api/customer/leave", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr, meal }),
        });
      }
    } catch {
      setError("Could not update meal preference right now.");
      return;
    }
    fetchMeals();
    fetchTomorrowMeals();
  };

  const handleLeaveRange = async (dates: string[], mealsList: string[]) => {
    setError(null);
    const res = await fetch("/api/customer/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates, meals: mealsList }),
    });
    if (!res.ok) {
      setError("Failed to mark leave for selected range.");
      throw new Error("Failed");
    }
    fetchMeals();
    fetchTomorrowMeals();
  };

  const setDefaultLocation = async (locationId: string) => {
    await fetch("/api/customer/locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: locationId, setAsDefault: true }),
    });
    fetchLocations();
    fetchMeals();
  };

  const selectLocation = async (locationId: string) => {
    if (!locationPickerMeal) return;
    await fetch("/api/customer/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateStr,
        mealType: locationPickerMeal,
        deliveryLocationId: locationId,
      }),
    });
    setLocationPickerMeal(null);
    fetchMeals();
  };

  if (!meals) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Hero card (same as Home) */}
      <div className="p-4 pb-0">
        <MessHeroCard tomorrowMeals={tomorrowMeals} />
      </div>
      {/* Manage your meals section */}
      <div className="p-4 pt-5">
        {error ? (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
        ) : null}
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-lg text-gray-900">Manage your meals</h1>
          <Link
            href="/overview"
            className="flex items-center gap-1.5 text-[#C0392B] font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </Link>
        </div>
        <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
        <div className="mt-4 space-y-4">
          <BookingToggle
            on={bookingOn}
            onToggle={toggleBooking}
            disabled={!editable}
          />
          <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden px-4">
            <MealToggleRow
              mealName="Breakfast"
              address={meals.B.location?.address ?? null}
              active={meals.B.active}
              onToggle={() => toggleMeal(MealType.BREAKFAST)}
              onAddressClick={() => setLocationPickerMeal(MealType.BREAKFAST)}
              disabled={!editable}
            />
            <MealToggleRow
              mealName="Lunch"
              address={meals.L.location?.address ?? null}
              active={meals.L.active}
              onToggle={() => toggleMeal(MealType.LUNCH)}
              onAddressClick={() => setLocationPickerMeal(MealType.LUNCH)}
              disabled={!editable}
            />
            <MealToggleRow
              mealName="Dinner"
              address={meals.D.location?.address ?? null}
              active={meals.D.active}
              onToggle={() => toggleMeal(MealType.DINNER)}
              onAddressClick={() => setLocationPickerMeal(MealType.DINNER)}
              disabled={!editable}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setLeaveModalOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#C0392B] text-white shadow-[0_2px_8px_rgba(192,57,43,0.4)] flex items-center justify-center z-40"
        aria-label="Mark leave"
      >
        <span className="text-2xl font-bold leading-none">+</span>
      </button>
      <LocationPicker
        open={!!locationPickerMeal}
        onClose={() => setLocationPickerMeal(null)}
        mealType={locationPickerMeal ?? ""}
        locations={locations}
        onSelect={selectLocation}
        onSetDefault={setDefaultLocation}
      />
      <LeaveRangeModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={handleLeaveRange}
      />
    </div>
  );
}
