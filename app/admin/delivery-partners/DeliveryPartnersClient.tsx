"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { MealType } from "@/lib/constants";

type Partner = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  activeOrders: number;
};

type AssignmentForm = {
  partnerId: string;
  mealType: string;
  date: string;
};

const mealLabel: Record<string, string> = {
  [MealType.BREAKFAST]: "Breakfast",
  [MealType.LUNCH]: "Lunch",
  [MealType.DINNER]: "Dinner",
};

export default function DeliveryPartnersClient() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [assign, setAssign] = useState<AssignmentForm>({
    partnerId: "",
    mealType: MealType.BREAKFAST,
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(() => {
    fetch("/api/admin/delivery-partners", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load partners");
        return res.json();
      })
      .then((rows) => {
        setPartners(rows);
        if (!assign.partnerId && rows[0]?.id) {
          setAssign((current) => ({ ...current, partnerId: rows[0].id }));
        }
      })
      .catch(() => setError("Could not load delivery partners."));
  }, [assign.partnerId]);

  useEffect(() => {
    fetchPartners();
    const intervalId = window.setInterval(fetchPartners, 5000);
    return () => window.clearInterval(intervalId);
  }, [fetchPartners]);

  async function createPartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/delivery-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          password: form.password,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Could not create partner.");
        return;
      }
      setForm({ name: "", phone: "", email: "", password: "" });
      setMessage("Delivery partner created.");
      fetchPartners();
    } catch {
      setError("Could not create partner.");
    } finally {
      setBusy(null);
    }
  }

  async function togglePartner(partner: Partner) {
    setBusy(partner.id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/delivery-partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: partner.id, isActive: !partner.isActive }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Could not update partner.");
        return;
      }
      setMessage(`${partner.name} ${partner.isActive ? "disabled" : "enabled"}.`);
      fetchPartners();
    } catch {
      setError("Could not update partner.");
    } finally {
      setBusy(null);
    }
  }

  async function assignRoute(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("assign");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/delivery-partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(assign),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Could not assign route.");
        return;
      }
      setMessage(`${json.assignedCount} order(s) assigned.`);
      fetchPartners();
    } catch {
      setError("Could not assign route.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Delivery Partners</h1>
          <p className="admin-subtitle">
            Create partner accounts, control access, and assign delivery routes.
          </p>
        </div>
      </header>

      {message ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <form onSubmit={assignRoute} className="admin-card">
            <h2 className="mb-3 font-semibold text-slate-900">Assign Orders</h2>
            <div className="grid gap-3 md:grid-cols-4">
              <select
                value={assign.partnerId}
                onChange={(event) =>
                  setAssign((current) => ({ ...current, partnerId: event.target.value }))
                }
                className="admin-input md:col-span-2"
                required
              >
                <option value="">Select partner</option>
                {partners
                  .filter((partner) => partner.isActive)
                  .map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} - {partner.phone}
                    </option>
                  ))}
              </select>
              <select
                value={assign.mealType}
                onChange={(event) =>
                  setAssign((current) => ({ ...current, mealType: event.target.value }))
                }
                className="admin-input"
              >
                {Object.values(MealType).map((meal) => (
                  <option key={meal} value={meal}>
                    {mealLabel[meal]}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={assign.date}
                onChange={(event) =>
                  setAssign((current) => ({ ...current, date: event.target.value }))
                }
                className="admin-input"
              />
            </div>
            <button
              type="submit"
              disabled={busy === "assign" || !assign.partnerId}
              className="admin-btn-primary mt-3 w-full sm:w-auto"
            >
              {busy === "assign" ? "Assigning..." : "Assign Route"}
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="hidden w-full md:table">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Active Orders</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{partner.name}</p>
                      <p className="text-sm text-slate-500">{partner.email || "No email"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{partner.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          partner.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {partner.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{partner.activeOrders}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => togglePartner(partner)}
                        disabled={busy === partner.id}
                        className="admin-btn-secondary px-3 py-2 text-xs"
                      >
                        {partner.isActive ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No delivery partners yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            <div className="space-y-3 p-3 md:hidden">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{partner.name}</p>
                      <p className="text-sm text-slate-600">{partner.phone}</p>
                      <p className="text-sm text-slate-500">{partner.activeOrders} active orders</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePartner(partner)}
                      disabled={busy === partner.id}
                      className="admin-btn-secondary px-3 py-2 text-xs"
                    >
                      {partner.isActive ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={createPartner} className="admin-card h-fit">
          <h2 className="mb-3 font-semibold text-slate-900">Create Partner</h2>
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Name"
              className="admin-input"
              required
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Phone"
              className="admin-input"
              required
            />
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email (optional)"
              className="admin-input"
              type="email"
            />
            <input
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Password"
              className="admin-input"
              type="password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy === "create"}
            className="admin-btn-primary mt-3 w-full"
          >
            {busy === "create" ? "Creating..." : "Create Delivery Partner"}
          </button>
        </form>
      </div>
    </div>
  );
}
