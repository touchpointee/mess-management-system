"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { MealType } from "@/lib/constants";

type PaymentRow = {
  id: string;
  date: string;
  amount: number;
  note: string | null;
  runningBalance: number;
};

type LedgerRow = {
  id: string;
  date: string;
  type: "CHARGE" | "PAYMENT";
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
};

type MonthlyClosingRow = {
  monthKey: string;
  label: string;
  openingBalance: number;
  debit: number;
  credit: number;
  closingBalance: number;
};

type HistoryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CustomerDetail = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  plan: { id: string; monthlyFee: number; startDate: string; isActive: boolean } | null;
  locations: { id: string; label: string; address: string; mealType: string }[];
  paymentHistory: PaymentRow[];
  ledger: LedgerRow[];
  monthlyClosing: MonthlyClosingRow[];
  leaves: { id: string; date: string; mealType: string; createdAt: string }[];
  bookings: { id: string; date: string; mealType: string; deliveryLocationId: string; createdAt: string }[];
  historyMeta: { leaves: HistoryMeta; bookings: HistoryMeta };
  cyclesCompleted: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  dueAmount: number;
  advanceAmount: number;
};

type CustomerDetailClientProps = { customerId: string };

export function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [leavesPage, setLeavesPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"ledger" | "monthly" | "leaves" | "bookings">("ledger");
  const [addPaymentAmount, setAddPaymentAmount] = useState("");
  const [addPaymentDate, setAddPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [addPaymentNote, setAddPaymentNote] = useState("");
  const [editPlanFee, setEditPlanFee] = useState("");
  const [editPlanStart, setEditPlanStart] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = (nextLeavesPage = leavesPage, nextBookingsPage = bookingsPage) => {
    fetch(
      `/api/admin/customers/${customerId}?leavesPage=${nextLeavesPage}&leavesLimit=20&bookingsPage=${nextBookingsPage}&bookingsLimit=20`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load customer");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLeavesPage(d.historyMeta?.leaves?.page ?? nextLeavesPage);
        setBookingsPage(d.historyMeta?.bookings?.page ?? nextBookingsPage);
        if (d.plan) {
          setEditPlanFee(String(d.plan.monthlyFee));
          setEditPlanStart(format(new Date(d.plan.startDate), "yyyy-MM-dd"));
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load customer"));
  };

  useEffect(() => {
    fetchDetail(1, 1);
  }, [customerId]);

  const refresh = () => fetchDetail(leavesPage, bookingsPage);

  const onAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addPaymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customerId,
          amount,
          date: addPaymentDate,
          note: addPaymentNote || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to add payment");
      }
      setAddPaymentAmount("");
      setAddPaymentNote("");
      setAddPaymentDate(format(new Date(), "yyyy-MM-dd"));
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const onEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(editPlanFee);
    if (isNaN(fee) || fee < 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyFee: fee,
          startDate: editPlanStart,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to update plan");
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update plan");
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) return <p className="text-slate-500">Loading...</p>;

  const mealLabel: Record<string, string> = {
    [MealType.BREAKFAST]: "Breakfast",
    [MealType.LUNCH]: "Lunch",
    [MealType.DINNER]: "Dinner",
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      ) : null}
      <div className="admin-card">
        <h2 className="font-semibold mb-2">Profile</h2>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Phone:</strong> {data.phone}</p>
        {data.email && <p><strong>Email:</strong> {data.email}</p>}
        {data.address && <p><strong>Address:</strong> {data.address}</p>}
      </div>

      {data.plan && (
        <div className="admin-card">
          <h2 className="font-semibold mb-2">Plan</h2>
          <p>Monthly fee: {formatCurrency(data.plan.monthlyFee)}</p>
          <p>Start date: {format(new Date(data.plan.startDate), "dd MMM yyyy")}</p>
          <p className="text-sm text-slate-500">Plan values are informational and not used for due calculation.</p>
          <p>Booked meals charged: {data.cyclesCompleted}</p>
          <form onSubmit={onEditPlan} className="mt-3 space-y-2 rounded-xl border border-slate-200 p-3">
            <input
              type="number"
              step="0.01"
              placeholder="Monthly fee"
              value={editPlanFee}
              onChange={(e) => setEditPlanFee(e.target.value)}
              className="admin-input"
            />
            <input
              type="date"
              value={editPlanStart}
              onChange={(e) => setEditPlanStart(e.target.value)}
              className="admin-input"
            />
            <button type="submit" disabled={submitting} className="admin-btn-primary">
              Update Plan
            </button>
          </form>
        </div>
      )}

      <div className="admin-card">
        <h2 className="font-semibold mb-2">Delivery Locations</h2>
        {data.locations.length === 0 ? (
          <p className="text-sm text-slate-500">None</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-700">
            {data.locations.map((l) => (
              <li key={l.id} className="break-words">
                [{mealLabel[l.mealType] ?? l.mealType}] {l.label}: {l.address}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-card">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={activeTab === "ledger" ? "admin-btn-primary" : "admin-btn-secondary"}
          >
            Account Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={activeTab === "monthly" ? "admin-btn-primary" : "admin-btn-secondary"}
          >
            Monthly Closing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("leaves")}
            className={activeTab === "leaves" ? "admin-btn-primary" : "admin-btn-secondary"}
          >
            Leave History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={activeTab === "bookings" ? "admin-btn-primary" : "admin-btn-secondary"}
          >
            Booking History
          </button>
        </div>

        {activeTab === "ledger" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Details</th>
                  <th className="py-2 text-right">Debit</th>
                  <th className="py-2 text-right">Credit</th>
                  <th className="py-2 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No ledger entries yet.
                    </td>
                  </tr>
                ) : (
                  data.ledger.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="py-2">{format(new Date(row.date), "dd MMM yyyy")}</td>
                      <td className="py-2">{row.type}</td>
                      <td className="py-2 break-words text-slate-600">{row.description}</td>
                      <td className="py-2 text-right">{row.debit ? formatCurrency(row.debit) : "-"}</td>
                      <td className="py-2 text-right">{row.credit ? formatCurrency(row.credit) : "-"}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(row.runningBalance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeTab === "monthly" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2">Month</th>
                  <th className="py-2 text-right">Opening</th>
                  <th className="py-2 text-right">Debit</th>
                  <th className="py-2 text-right">Credit</th>
                  <th className="py-2 text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyClosing.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No monthly data yet.
                    </td>
                  </tr>
                ) : (
                  data.monthlyClosing.map((row) => (
                    <tr key={row.monthKey} className="border-t border-slate-100">
                      <td className="py-2">{row.label}</td>
                      <td className="py-2 text-right">{formatCurrency(row.openingBalance)}</td>
                      <td className="py-2 text-right">{formatCurrency(row.debit)}</td>
                      <td className="py-2 text-right">{formatCurrency(row.credit)}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(row.closingBalance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeTab === "leaves" ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="py-2">Date</th>
                    <th className="py-2">Meal</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaves.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-500">
                        No leave history found.
                      </td>
                    </tr>
                  ) : (
                    data.leaves.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="py-2">{format(new Date(row.date), "dd MMM yyyy")}</td>
                        <td className="py-2">{mealLabel[row.mealType] ?? row.mealType}</td>
                        <td className="py-2 text-slate-500">{format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Page {data.historyMeta.leaves.page} of {data.historyMeta.leaves.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={data.historyMeta.leaves.page <= 1}
                  onClick={() => fetchDetail(Math.max(1, leavesPage - 1), bookingsPage)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={data.historyMeta.leaves.page >= data.historyMeta.leaves.totalPages}
                  onClick={() =>
                    fetchDetail(
                      Math.min(data.historyMeta.leaves.totalPages, leavesPage + 1),
                      bookingsPage
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "bookings" ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="py-2">Date</th>
                    <th className="py-2">Meal</th>
                    <th className="py-2">Location</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        No booking history found.
                      </td>
                    </tr>
                  ) : (
                    data.bookings.map((row) => {
                      const location = data.locations.find((l) => l.id === row.deliveryLocationId);
                      return (
                        <tr key={row.id} className="border-t border-slate-100">
                          <td className="py-2">{format(new Date(row.date), "dd MMM yyyy")}</td>
                          <td className="py-2">{mealLabel[row.mealType] ?? row.mealType}</td>
                          <td className="py-2 text-slate-600">{location?.label ?? row.deliveryLocationId}</td>
                          <td className="py-2 text-slate-500">
                            {format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Page {data.historyMeta.bookings.page} of {data.historyMeta.bookings.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={data.historyMeta.bookings.page <= 1}
                  onClick={() => fetchDetail(leavesPage, Math.max(1, bookingsPage - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={data.historyMeta.bookings.page >= data.historyMeta.bookings.totalPages}
                  onClick={() =>
                    fetchDetail(
                      leavesPage,
                      Math.min(data.historyMeta.bookings.totalPages, bookingsPage + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 border-t border-slate-200 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Closing Balance Summary</h3>
          <p className="mt-2 text-[#27AE60]">Total paid: {formatCurrency(data.totalPaid)}</p>
          <p>Total due: {formatCurrency(data.totalDue)}</p>
          {data.dueAmount > 0 ? (
            <p className="font-bold text-red-600">Due amount: {formatCurrency(data.dueAmount)}</p>
          ) : data.advanceAmount > 0 ? (
            <p className="font-bold text-[#27AE60]">Advance/credit: {formatCurrency(data.advanceAmount)}</p>
          ) : (
            <p className="font-bold text-slate-600">Account settled</p>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h2 className="font-semibold mb-2">Add Payment</h2>
        <form onSubmit={onAddPayment} className="space-y-2">
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={addPaymentAmount}
            onChange={(e) => setAddPaymentAmount(e.target.value)}
            className="admin-input"
            required
          />
          <input
            type="date"
            value={addPaymentDate}
            onChange={(e) => setAddPaymentDate(e.target.value)}
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={addPaymentNote}
            onChange={(e) => setAddPaymentNote(e.target.value)}
            className="admin-input"
          />
          <button
            type="submit"
            disabled={submitting}
            className="admin-btn-primary w-full sm:w-auto"
          >
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
}
