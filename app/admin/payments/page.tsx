"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DueFeesCard } from "@/components/admin/DueFeesCard";

type DueCustomer = {
  id: string;
  name: string;
  phone: string;
  cyclesCompleted: number;
  billableMeals: number;
  totalDue: number;
  totalPaid: number;
  dueAmount: number;
  advanceAmount: number;
};

type CustomerOption = { id: string; name: string; phone: string };

export default function AdminPaymentsPage() {
  const [dueList, setDueList] = useState<DueCustomer[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments/due")
      .then((r) => r.json())
      .then(setDueList);
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((list: { id: string; name: string; phone: string }[]) =>
        setCustomers(list.map((c) => ({ id: c.id, name: c.name, phone: c.phone })))
      );
  }, []);

  const refreshDue = () => {
    fetch("/api/admin/payments/due")
      .then((r) => r.json())
      .then(setDueList);
  };

  const onSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!selectedUserId || isNaN(amt) || amt <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: amt,
          date: paymentDate,
          note: note || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to record payment");
      }
      setAmount("");
      setNote("");
      setPaymentDate(format(new Date(), "yyyy-MM-dd"));
      refreshDue();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Payments</h1>
          <p className="admin-subtitle">Record payments and track outstanding balances.</p>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-card">
          <h2 className="font-semibold mb-4">Record Payment</h2>
          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
          <form onSubmit={onSubmitPayment} className="space-y-3">
            <div>
              <label className="admin-label">Customer</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="admin-input"
                required
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="admin-input"
                required
              />
            </div>
            <div>
              <label className="admin-label">Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="admin-input"
              />
            </div>
            <button type="submit" disabled={submitting} className="admin-btn-primary w-full">
              {submitting ? "Saving..." : "Submit"}
            </button>
          </form>
        </div>
        <div>
          <h2 className="font-semibold mb-4">Customers with Outstanding Balance</h2>
          <div className="space-y-4">
            {dueList.length === 0 ? (
              <p className="admin-card text-slate-500">No outstanding balances.</p>
            ) : (
              dueList.map((c) => (
                <DueFeesCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  phone={c.phone}
                  cyclesCompleted={c.cyclesCompleted}
                  billableMeals={c.billableMeals}
                  totalDue={c.totalDue}
                  totalPaid={c.totalPaid}
                  dueAmount={c.dueAmount}
                  onCollectPayment={() => {
                    setSelectedUserId(c.id);
                    setAmount(String(c.dueAmount));
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

