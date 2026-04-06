"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function PlanSummaryCard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/customer/account")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(setData)
      .catch(() => null);
  }, []);

  if (!data || !data.user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 border border-gray-100 animate-slide-up relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full gradient-primary opacity-5 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-[#C0392B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          My Plan & Credit
        </h2>
        {data.user.startDate ? (
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#27AE60] bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">Active</span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">Inactive</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 transition-colors hover:bg-gray-100">
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Available Credit</p>
          <p className={`font-bold text-xl ${data.advanceAmount > 0 ? "text-[#27AE60]" : "text-gray-900"}`}>
            {data.advanceAmount > 0 ? formatCurrency(data.advanceAmount) : "Rs 0"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 transition-colors hover:bg-gray-100">
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Due Amount</p>
          <p className={`font-bold text-xl ${data.dueAmount > 0 ? "text-[#C0392B]" : "text-gray-900"}`}>
            {data.dueAmount > 0 ? formatCurrency(data.dueAmount) : "Rs 0"}
          </p>
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-0.5">Plan Validity</p>
          <p className="text-sm font-semibold text-slate-800">
            {data.user.startDate ? format(new Date(data.user.startDate), "MMM d, yyyy") : "—"}
            {" - "}
            {data.user.endDate ? format(new Date(data.user.endDate), "MMM d, yyyy") : "No limit"}
          </p>
        </div>
      </div>
    </div>
  );
}
