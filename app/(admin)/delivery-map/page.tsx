"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DeliveryMapView } from "@/components/admin/DeliveryMapView";
import { MealType } from "@/lib/constants";

type RouteStop = {
  stopNumber: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceFromPrev: number;
};

type RouteRes = {
  route: RouteStop[];
  totalDistanceKm: number;
  mess: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
};

export default function AdminDeliveryMapPage() {
  const [meal, setMeal] = useState<string>(MealType.BREAKFAST);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<RouteRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mealLabel: Record<string, string> = {
    [MealType.BREAKFAST]: "Breakfast",
    [MealType.LUNCH]: "Lunch",
    [MealType.DINNER]: "Dinner",
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/delivery-map?meal=${meal}&date=${date}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => null);
          throw new Error(body?.message ?? "Failed to load route");
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        setData(null);
        setError(e instanceof Error ? e.message : "Failed to load route");
      })
      .finally(() => setLoading(false));
  }, [meal, date]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Delivery Map</h1>
          <p className="admin-subtitle">Plan and review optimized delivery routes by meal.</p>
        </div>
      </header>
      <div className="space-y-4">
        <div className="admin-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMeal(m)}
                className={`admin-btn ${
                  meal === m ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {mealLabel[m] ?? m}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="admin-input w-full sm:w-auto"
          />
        </div>
        {loading ? (
          <p className="text-slate-500">Loading route...</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        ) : data?.route ? (
          <DeliveryMapView
            route={data.route}
            totalDistanceKm={data.totalDistanceKm}
            mealType={meal}
            mess={data.mess}
          />
        ) : (
          <div className="admin-card text-slate-500">
            No deliveries found for {mealLabel[meal]?.toLowerCase() ?? meal.toLowerCase()} on this date.
          </div>
        )}
      </div>
    </div>
  );
}
