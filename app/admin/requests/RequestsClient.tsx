"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

type PendingRequest = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string | null;
};

export default function RequestsClient() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(() => {
    setError(null);
    fetch("/api/admin/requests", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load requests");
        return res.json();
      })
      .then(setRequests)
      .catch(() => setError("Could not load pending requests."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRequests();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchRequests();
    }, 5000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchRequests();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchRequests]);

  async function approve(id: string) {
    setApprovingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Could not approve request.");
        return;
      }
      setRequests((current) => current.filter((request) => request.id !== id));
    } catch {
      setError("Could not approve request.");
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Requests</h1>
          <p className="admin-subtitle">
            Review new account requests before they become active customers.
          </p>
        </div>
      </header>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Requested</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{request.name}</td>
                <td className="px-4 py-3 text-slate-600">{request.phone}</td>
                <td className="px-4 py-3 text-slate-600">{request.email || "-"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {request.createdAt
                    ? format(new Date(request.createdAt), "dd MMM yyyy, h:mm a")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => approve(request.id)}
                    disabled={approvingId === request.id}
                    className="admin-btn-primary px-3 py-2 text-xs"
                  >
                    {approvingId === request.id ? "Approving..." : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  No pending requests.
                </td>
              </tr>
            ) : null}
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  Loading requests...
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {requests.map((request) => (
          <div key={request.id} className="admin-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{request.name}</p>
                <p className="text-sm text-slate-600">{request.phone}</p>
                <p className="text-sm text-slate-600">{request.email || "No email"}</p>
              </div>
              <button
                type="button"
                onClick={() => approve(request.id)}
                disabled={approvingId === request.id}
                className="admin-btn-primary px-3 py-2 text-xs"
              >
                {approvingId === request.id ? "Approving..." : "Approve"}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Requested{" "}
              {request.createdAt
                ? format(new Date(request.createdAt), "dd MMM yyyy, h:mm a")
                : "-"}
            </p>
          </div>
        ))}
        {!loading && requests.length === 0 ? (
          <div className="admin-card text-sm text-slate-500">No pending requests.</div>
        ) : null}
        {loading ? (
          <div className="admin-card text-sm text-slate-500">Loading requests...</div>
        ) : null}
      </div>
    </div>
  );
}
