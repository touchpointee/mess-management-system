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
  startDate: string | null;
  endDate: string | null;
  offerPrices?: { breakfast: number | null; lunch: number | null; dinner: number | null };
  effectiveMealPrices?: { breakfastPrice: number; lunchPrice: number; dinnerPrice: number };
  locations: { id: string; label: string; address: string; mealType: string }[];
  paymentHistory: PaymentRow[];
  ledger: LedgerRow[];
  monthlyClosing: MonthlyClosingRow[];
  leaves: { id: string; date: string; mealType: string; createdAt: string }[];
  bookings: {
    id: string;
    date: string;
    mealType: string;
    deliveryLocationId: string;
    createdAt: string;
  }[];
  historyMeta: { leaves: HistoryMeta; bookings: HistoryMeta };
  cyclesCompleted: number;
  billableMealCount: number;
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
  const [activeTab, setActiveTab] = useState<"ledger" | "monthly" | "leaves" | "bookings">(
    "ledger"
  );
  const [addPaymentAmount, setAddPaymentAmount] = useState("");
  const [addPaymentDate, setAddPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [addPaymentNote, setAddPaymentNote] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [offerBreakfast, setOfferBreakfast] = useState("");
  const [offerLunch, setOfferLunch] = useState("");
  const [offerDinner, setOfferDinner] = useState("");
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
        setEditStartDate(d.startDate ? format(new Date(d.startDate), "yyyy-MM-dd") : "");
        setEditEndDate(d.endDate ? format(new Date(d.endDate), "yyyy-MM-dd") : "");
        setOfferBreakfast(
          d.offerPrices?.breakfast === null || d.offerPrices?.breakfast === undefined
            ? ""
            : String(d.offerPrices.breakfast)
        );
        setOfferLunch(
          d.offerPrices?.lunch === null || d.offerPrices?.lunch === undefined
            ? ""
            : String(d.offerPrices.lunch)
        );
        setOfferDinner(
          d.offerPrices?.dinner === null || d.offerPrices?.dinner === undefined
            ? ""
            : String(d.offerPrices.dinner)
        );
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

  const onSavePlanDates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: editStartDate || null,
          endDate: editEndDate || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to update plan dates");
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update plan dates");
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveOfferPrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerPrices: {
            breakfast: offerBreakfast === "" ? null : Number(offerBreakfast),
            lunch: offerLunch === "" ? null : Number(offerLunch),
            dinner: offerDinner === "" ? null : Number(offerDinner),
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to update offer prices");
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update offer prices");
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}
      <div className="admin-card">
        <h2 className="font-semibold mb-2">Profile</h2>
        <div className="space-y-1 text-sm sm:text-base">
          <p className="break-words">
            <strong>Name:</strong> {data.name}
          </p>
          <p className="break-words">
            <strong>Phone:</strong> {data.phone}
          </p>
          {data.email && (
            <p className="break-words">
              <strong>Email:</strong> {data.email}
            </p>
          )}
          {data.address && (
            <p className="break-words">
              <strong>Address:</strong> {data.address}
            </p>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h2 className="font-semibold mb-2">Billing</h2>
        <p className="text-sm text-slate-600">
          Dues use the mess meal prices, unless an offer price is set for this customer. Charges apply from the billing start date; leaves exclude a meal from
          billing. Payment is due every 30 days from the start date.
        </p>
        {data.effectiveMealPrices ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Breakfast price</p>
              <p className="font-semibold">{formatCurrency(data.effectiveMealPrices.breakfastPrice)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Lunch price</p>
              <p className="font-semibold">{formatCurrency(data.effectiveMealPrices.lunchPrice)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Dinner price</p>
              <p className="font-semibold">{formatCurrency(data.effectiveMealPrices.dinnerPrice)}</p>
            </div>
          </div>
        ) : null}
        <p className="mt-2 text-sm text-slate-700">
          <strong>Plan Limit:</strong>{" "}
          {data.startDate ? format(new Date(data.startDate), "dd MMM yyyy") : "Not set"}
          {" to "}
          {data.endDate ? format(new Date(data.endDate), "dd MMM yyyy") : "No limit"}
        </p>
        <p>
          <strong>30-day cycles completed:</strong> {data.cyclesCompleted}
        </p>
        <p>
          <strong>Billable meals (booked − leave):</strong> {data.billableMealCount}
        </p>
        <form onSubmit={onSavePlanDates} className="mt-3 space-y-2 rounded-xl border border-slate-200 p-3">
          <label className="admin-label">Plan Limits (Start & End Date)</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <span className="text-xs text-slate-500">From Date</span>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <span className="text-xs text-slate-500">To Date</span>
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="admin-btn-primary">
            Save plan dates
          </button>
        </form>

        <form onSubmit={onSaveOfferPrices} className="mt-3 space-y-2 rounded-xl border border-slate-200 p-3">
          <label className="admin-label">Offer meal prices for this customer (optional)</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="number"
              min="0"
              step="0.01"
              value={offerBreakfast}
              onChange={(e) => setOfferBreakfast(e.target.value)}
              className="admin-input"
              placeholder="Breakfast"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={offerLunch}
              onChange={(e) => setOfferLunch(e.target.value)}
              className="admin-input"
              placeholder="Lunch"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={offerDinner}
              onChange={(e) => setOfferDinner(e.target.value)}
              className="admin-input"
              placeholder="Dinner"
            />
          </div>
          <p className="text-xs text-slate-500">
            Leave blank to use mess default prices from Settings.
          </p>
          <button type="submit" disabled={submitting} className="admin-btn-primary">
            Save offer prices
          </button>
        </form>
      </div>

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
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`w-full ${activeTab === "ledger" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          >
            Account Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`w-full ${activeTab === "monthly" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          >
            Monthly Closing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("leaves")}
            className={`w-full ${activeTab === "leaves" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          >
            Leave History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`w-full ${activeTab === "bookings" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          >
            Booking History
          </button>
        </div>

        {activeTab === "ledger" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
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
            <table className="w-full min-w-[620px] text-sm">
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
              <table className="w-full min-w-[520px] text-sm">
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
                        <td className="py-2 text-slate-500">
                          {format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Page {data.historyMeta.leaves.page} of {data.historyMeta.leaves.totalPages}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  className="admin-btn-secondary w-full sm:w-auto"
                  disabled={data.historyMeta.leaves.page <= 1}
                  onClick={() => fetchDetail(Math.max(1, leavesPage - 1), bookingsPage)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary w-full sm:w-auto"
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
              <table className="w-full min-w-[620px] text-sm">
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Page {data.historyMeta.bookings.page} of {data.historyMeta.bookings.totalPages}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  className="admin-btn-secondary w-full sm:w-auto"
                  disabled={data.historyMeta.bookings.page <= 1}
                  onClick={() => fetchDetail(leavesPage, Math.max(1, bookingsPage - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary w-full sm:w-auto"
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
          <button type="submit" disabled={submitting} className="admin-btn-primary w-full sm:w-auto">
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
}

