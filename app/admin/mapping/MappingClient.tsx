"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

type MappedPhone = {
  id: string;
  phone: string;
  registeredName: string | null;
  createdAt: string | null;
};

export default function MappingClient() {
  const [phones, setPhones] = useState<MappedPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPhones = useCallback(() => {
    fetch("/api/admin/mapping", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load mappings");
        return res.json();
      })
      .then(setPhones)
      .catch(() => setError("Could not load mapped phone numbers."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhone.trim()) return;
    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: newPhone }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Failed to map phone number.");
        return;
      }
      setSuccess("Phone number added successfully!");
      setNewPhone("");
      fetchPhones();
    } catch {
      setError("Could not add phone number.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this mapping?")) return;
    setDeletingId(id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/mapping?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Failed to delete mapping.");
        return;
      }
      setSuccess("Mapping removed successfully!");
      fetchPhones();
    } catch {
      setError("Could not delete mapping.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredPhones = phones.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.phone.toLowerCase().includes(query) ||
      (p.registeredName && p.registeredName.toLowerCase().includes(query))
    );
  });

  const totalCount = phones.length;
  const registeredCount = phones.filter((p) => p.registeredName !== null).length;
  const pendingCount = totalCount - registeredCount;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Customer Mapping</h1>
          <p className="admin-subtitle">
            Manage phone numbers that are pre-approved to auto-map to your mess workspace.
          </p>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="admin-card flex flex-col justify-between p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Pre-Approved
          </span>
          <span className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</span>
        </div>
        <div className="admin-card flex flex-col justify-between p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
            Registered
          </span>
          <span className="mt-2 text-2xl font-bold text-emerald-600">{registeredCount}</span>
        </div>
        <div className="admin-card flex flex-col justify-between p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Pending Signup
          </span>
          <span className="mt-2 text-2xl font-bold text-amber-600">{pendingCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Section: Add Number Form */}
        <div className="space-y-4">
          <div className="admin-card">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Add Phone Number</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter a phone number (e.g. +919876543210) to authorize registration and map them to your mess workspace.
            </p>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="admin-label">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +919876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="admin-input w-full"
                  disabled={adding}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={adding || !newPhone.trim()}
                className="admin-btn-primary w-full py-2.5 font-semibold text-sm"
              >
                {adding ? "Adding..." : "Add to Mapping"}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-fade-in">
                ✅ {success}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Mapping List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="admin-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Pre-Approved Numbers</h2>
              <input
                type="text"
                placeholder="Search phone or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input py-1.5 px-3 text-sm max-w-xs"
              />
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Phone Number</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Date Added</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPhones.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.phone}</td>
                      <td className="px-4 py-3">
                        {item.registeredName ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                            Registered: {item.registeredName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                            Pending Signup
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.createdAt ? format(new Date(item.createdAt), "dd MMM yyyy, h:mm a") : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                        >
                          {deletingId === item.id ? "Removing..." : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredPhones.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500 italic">
                        No phone mappings found matching the criteria.
                      </td>
                    </tr>
                  ) : null}
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">
                        Loading mappings...
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="space-y-3 md:hidden">
              {filteredPhones.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.phone}</p>
                      <div className="mt-2">
                        {item.registeredName ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                            Registered: {item.registeredName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                            Pending Signup
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Added {item.createdAt ? format(new Date(item.createdAt), "dd MMM yyyy, h:mm a") : "-"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                    >
                      {deletingId === item.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
              {!loading && filteredPhones.length === 0 ? (
                <div className="text-center text-slate-500 italic py-4">No phone mappings found.</div>
              ) : null}
              {loading ? <div className="text-center text-slate-500 py-4">Loading mappings...</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
