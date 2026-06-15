"use client";

import { useState } from "react";

type MapCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  onMapped: () => void;
};

export function MapCustomerModal({ open, onClose, onMapped }: MapCustomerModalProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/customers/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message ?? "Failed to map customer");
      }
      setSuccess(json.message ?? "Customer mapped successfully!");
      setPhone("");
      // Wait a short moment to show success message before closing and refreshing
      setTimeout(() => {
        setSuccess(null);
        onMapped();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Map Registered User</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <p className="text-slate-500 text-xs mb-4">
          Input the registered phone number of a customer to link their account to your mess workspace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-fade-in">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="admin-label">Registered Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. +919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="admin-input"
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="admin-btn-secondary flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn-primary flex-1"
              disabled={submitting || !phone}
            >
              {submitting ? "Mapping..." : "Map User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
