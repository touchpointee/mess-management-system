"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";

type DashboardRes = {
  breakfast: number;
  lunch: number;
  dinner: number;
  tomorrowBreakfast: number;
  tomorrowLunch: number;
  tomorrowDinner: number;
  todayLabel: string;
  tomorrowLabel: string;
  activeCustomers: number;
  leaveSummary: { customerId: string; name: string; B: boolean; L: boolean; D: boolean }[];
};

export function DashboardData() {
  const [data, setData] = useState<DashboardRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch dashboard data");
        return r.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">Error loading dashboard</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="🍳"
          value={data.breakfast}
          label="Breakfast Deliveries"
          accentColor="#f97316"
        />
        <StatCard
          icon="🍱"
          value={data.lunch}
          label="Lunch Deliveries"
          accentColor="#22c55e"
        />
        <StatCard
          icon="🌙"
          value={data.dinner}
          label="Dinner Deliveries"
          accentColor="#3b82f6"
        />
        <StatCard
          icon="👥"
          value={data.activeCustomers}
          label="Active Customers"
          accentColor="#6366f1"
        />
      </div>
      <div className="admin-card">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Tomorrow Meal Requirements</h2>
          <span className="text-sm text-slate-500">{data.tomorrowLabel}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
            <p className="text-sm text-slate-600">Breakfast</p>
            <p className="text-2xl font-bold text-orange-600">{data.tomorrowBreakfast}</p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-3">
            <p className="text-sm text-slate-600">Lunch</p>
            <p className="text-2xl font-bold text-green-600">{data.tomorrowLunch}</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-sm text-slate-600">Dinner</p>
            <p className="text-2xl font-bold text-blue-600">{data.tomorrowDinner}</p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Today's Leave Summary</h2>
          <p className="mt-1 text-sm text-slate-500">
            {data.leaveSummary.length} customer(s) on leave on {data.todayLabel}
          </p>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Customer</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Breakfast</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Lunch</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Dinner</th>
              </tr>
            </thead>
            <tbody>
              {data.leaveSummary.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    No leaves today.
                  </td>
                </tr>
              ) : (
                data.leaveSummary.map((row) => (
                  <tr key={row.customerId} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-4 text-center">
                      {row.B ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          On Leave
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {row.L ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          On Leave
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {row.D ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          On Leave
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {data.leaveSummary.length === 0 ? (
            <p className="text-sm text-slate-500">No leaves today.</p>
          ) : (
            data.leaveSummary.map((row) => (
              <div key={row.customerId} className="rounded-xl border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{row.name}</p>
                <p className="mt-2 text-sm text-slate-600">
                  B: {row.B ? "On Leave" : "-"} | L: {row.L ? "On Leave" : "-"} | D:{" "}
                  {row.D ? "On Leave" : "-"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
