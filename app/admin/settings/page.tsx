"use client";

import { FormEvent, useEffect, useState } from "react";
import { CoordinatePickerModal } from "@/components/common/CoordinatePickerModal";
import { format } from "date-fns";

type SystemSettingsRes = {
  businessName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
};

export default function AdminSettingsPage() {
  const [businessName, setBusinessName] = useState("Mess");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [breakfastPrice, setBreakfastPrice] = useState("");
  const [lunchPrice, setLunchPrice] = useState("");
  const [dinnerPrice, setDinnerPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [holidays, setHolidays] = useState<any[]>([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayMealType, setHolidayMealType] = useState("ALL");
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [holidayMode, setHolidayMode] = useState<"SINGLE" | "BULK">("SINGLE");
  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkDayOfWeek, setBulkDayOfWeek] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/system")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return (await res.json()) as SystemSettingsRes;
      })
      .then((data) => {
        setBusinessName(data.businessName || "Mess");
        setAddress(data.address || "");
        setCity(data.city || "");
        setLat(String(data.lat ?? ""));
        setLng(String(data.lng ?? ""));
        setBreakfastPrice(String(data.breakfastPrice ?? ""));
        setLunchPrice(String(data.lunchPrice ?? ""));
        setDinnerPrice(String(data.dinnerPrice ?? ""));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));

    fetch("/api/admin/holidays")
      .then((res) => res.json())
      .then(setHolidays)
      .catch(console.error);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload = {
      businessName: businessName.trim(),
      address: address.trim(),
      city: city.trim(),
      lat: Number(lat),
      lng: Number(lng),
      breakfastPrice: Number(breakfastPrice),
      lunchPrice: Number(lunchPrice),
      dinnerPrice: Number(dinnerPrice),
    };
    try {
      const res = await fetch("/api/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message ?? "Failed to save location");
      }
      setBusinessName(body?.businessName ?? businessName);
      setSuccess("Mess settings updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const onAddHoliday = async (e: FormEvent) => {
    e.preventDefault();
    let datesToSubmit: string[] = [];

    if (holidayMode === "SINGLE") {
      if (!holidayDate) return;
      datesToSubmit = [holidayDate];
    } else {
      if (!bulkMonth || !bulkDayOfWeek) return;
      const [year, month] = bulkMonth.split("-").map(Number);
      const targetDay = Number(bulkDayOfWeek);
      
      const dateIter = new Date(year, month - 1, 1);
      while (dateIter.getMonth() === month - 1) {
        if (dateIter.getDay() === targetDay) {
          datesToSubmit.push(format(dateIter, "yyyy-MM-dd"));
        }
        dateIter.setDate(dateIter.getDate() + 1);
      }
    }

    if (datesToSubmit.length === 0) return;

    setAddingHoliday(true);
    try {
      await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: datesToSubmit, mealType: holidayMealType }),
      });
      const res = await fetch("/api/admin/holidays");
      setHolidays(await res.json());
      setHolidayDate("");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingHoliday(false);
    }
  };

  const onDeleteHoliday = async (id: string) => {
    try {
      await fetch(`/api/admin/holidays?id=${id}`, { method: "DELETE" });
      const res = await fetch("/api/admin/holidays");
      setHolidays(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Settings</h1>
          <p className="admin-subtitle">Configure business location used for routing.</p>
        </div>
      </header>
      <div className="max-w-2xl">
        <div className="admin-card">
          <h2 className="font-semibold text-slate-900">Mess Location</h2>
          <p className="mt-1 text-sm text-slate-500">
            Delivery route starts from this location for all map calculations.
          </p>

          {loading ? <p className="mt-4 text-sm text-slate-500">Loading settings...</p> : null}

          {!loading ? (
            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="admin-label">Mess Name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="admin-input"
                  placeholder="Enter mess name"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="admin-input"
                  placeholder="Enter mess address"
                  required
                />
              </div>

              <div>
                <label className="admin-label">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="admin-input"
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Mess location (Map)</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setMapOpen(true)}
                    className="admin-btn-secondary w-full"
                  >
                    {lat && lng ? "Change location" : "Select location on map"}
                  </button>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="text-slate-500">Selected:</span>{" "}
                    {lat && lng ? (
                      <span className="font-medium">
                        {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                  <input type="hidden" value={lat} readOnly required />
                  <input type="hidden" value={lng} readOnly required />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="admin-label">Breakfast Price (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={breakfastPrice}
                    onChange={(e) => setBreakfastPrice(e.target.value)}
                    className="admin-input"
                    placeholder="60"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Lunch Price (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lunchPrice}
                    onChange={(e) => setLunchPrice(e.target.value)}
                    className="admin-input"
                    placeholder="90"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Dinner Price (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dinnerPrice}
                    onChange={(e) => setDinnerPrice(e.target.value)}
                    className="admin-input"
                    placeholder="80"
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {success}
                </div>
              ) : null}

              <button type="submit" disabled={saving} className="admin-btn-primary">
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          ) : null}
        </div>

        {/* MESS HOLIDAYS SECTION */}
        <div className="admin-card mt-6">
          <h2 className="font-semibold text-slate-900">Mess Holidays</h2>
          <p className="mt-1 text-sm text-slate-500 mb-4">
            Mark days when the mess is closed. Customers will not be charged.
          </p>

          <div className="flex gap-4 mb-4 text-sm text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={holidayMode === "SINGLE"} onChange={() => setHolidayMode("SINGLE")} className="accent-[#C0392B]" /> Single Day
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={holidayMode === "BULK"} onChange={() => setHolidayMode("BULK")} className="accent-[#C0392B]" /> Bulk Add (by Day of Week)
            </label>
          </div>
          
          <form onSubmit={onAddHoliday} className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            {holidayMode === "SINGLE" ? (
              <div className="flex-1 w-full">
                <label className="admin-label">Date</label>
                <input 
                  type="date" 
                  required 
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="admin-input" 
                />
              </div>
            ) : (
              <>
                <div className="flex-1 w-full">
                  <label className="admin-label">Month</label>
                  <input 
                    type="month" 
                    required 
                    value={bulkMonth}
                    onChange={(e) => setBulkMonth(e.target.value)}
                    className="admin-input" 
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="admin-label">Day of Week</label>
                  <select 
                    required 
                    value={bulkDayOfWeek}
                    onChange={(e) => setBulkDayOfWeek(e.target.value)}
                    className="admin-input w-full"
                  >
                    <option value="">Select Day</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              </>
            )}
            <div className="flex-1 w-full">
              <label className="admin-label">Meal Type</label>
              <select 
                value={holidayMealType}
                onChange={(e) => setHolidayMealType(e.target.value)}
                className="admin-input"
              >
                <option value="ALL">Full Day (All Meals)</option>
                <option value="BREAKFAST">Breakfast Only</option>
                <option value="LUNCH">Lunch Only</option>
                <option value="DINNER">Dinner Only</option>
              </select>
            </div>
            <button type="submit" disabled={addingHoliday} className="admin-btn-primary whitespace-nowrap h-10 mt-6 sm:mt-0">
              {addingHoliday ? "Adding..." : "Add Holiday"}
            </button>
          </form>

          {holidays.length === 0 ? (
            <p className="text-sm text-slate-500 italic p-4 text-center border rounded-xl bg-slate-50 border-dashed">No upcoming holidays scheduled.</p>
          ) : (
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {holidays.map(h => (
                    <tr key={h.id}>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                        {format(new Date(h.date), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {h.mealType === "ALL" ? <span className="text-[#C0392B] font-medium">Full Day</span> : h.mealType}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button 
                          onClick={() => onDeleteHoliday(h.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CoordinatePickerModal
        open={mapOpen}
        title="Select mess location"
        initial={
          Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
            ? { lat: Number(lat), lng: Number(lng) }
            : null
        }
        onClose={() => setMapOpen(false)}
        onConfirm={(coords) => {
          setLat(String(coords.lat));
          setLng(String(coords.lng));
        }}
      />
    </div>
  );
}

