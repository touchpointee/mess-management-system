"use client";

import { useEffect, useState } from "react";

type MessRes = {
  id: string;
  businessName: string;
  shortName: string;
  phone: string;
  supportEmail: string | null;
  address: string;
  city: string;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  customersCount: number;
  partnersCount: number;
  admin: {
    name: string;
    phone: string;
    email: string | null;
  } | null;
};

type DashboardRes = {
  messes: MessRes[];
  stats: {
    totalMesses: number;
    totalCustomers: number;
    totalAdmins: number;
  };
};

export default function SuperAdminPage() {
  const [data, setData] = useState<DashboardRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [shortName, setShortName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("8.56");
  const [lng, setLng] = useState("76.882");
  const [breakfastPrice, setBreakfastPrice] = useState("60");
  const [lunchPrice, setLunchPrice] = useState("90");
  const [dinnerPrice, setDinnerPrice] = useState("80");
  
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // User Mapping State
  const [mapPhone, setMapPhone] = useState("");
  const [mapMessId, setMapMessId] = useState("");
  const [mapSubmitting, setMapSubmitting] = useState(false);
  const [mapSuccess, setMapSuccess] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const fetchDashboard = () => {
    fetch("/api/super-admin/messes")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch messes directory.");
        return r.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
        if (res.messes && res.messes.length > 0 && !mapMessId) {
          setMapMessId(res.messes[0].id);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAddMess = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/super-admin/messes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          shortName,
          phone,
          email,
          address,
          city,
          lat: Number(lat),
          lng: Number(lng),
          breakfastPrice: Number(breakfastPrice),
          lunchPrice: Number(lunchPrice),
          dinnerPrice: Number(dinnerPrice),
          adminName,
          adminPhone,
          adminEmail,
          adminPassword,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to create mess");
      }

      // Reset form & Close modal
      setBusinessName("");
      setShortName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setCity("");
      setLat("8.56");
      setLng("76.882");
      setBreakfastPrice("60");
      setLunchPrice("90");
      setDinnerPrice("80");
      setAdminName("");
      setAdminPhone("");
      setAdminEmail("");
      setAdminPassword("");
      setModalOpen(false);

      // Refresh data
      fetchDashboard();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMapUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMapSuccess(null);
    setMapError(null);
    setMapSubmitting(true);

    try {
      const response = await fetch("/api/super-admin/messes/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mapPhone, messId: mapMessId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to map user");
      }
      setMapSuccess(result.message || "User successfully mapped.");
      setMapPhone("");
      fetchDashboard();
    } catch (err: any) {
      setMapError(err.message);
    } finally {
      setMapSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-medium animate-pulse">Initializing SaaS Panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-soft animate-fade-in">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
            !
          </div>
          <p className="text-red-800 font-semibold text-lg">Error loading Super Admin Portal</p>
          <p className="text-red-600 text-sm mt-1 mb-4">{error}</p>
          <button onClick={fetchDashboard} className="admin-btn-primary bg-red-700 hover:bg-red-800">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const filteredMesses = data?.messes.filter((m) =>
    m.businessName.toLowerCase().includes(search.toLowerCase()) ||
    m.city.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="admin-page animate-slide-up space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Messes Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and provision SaaS tenant workspaces globally.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 shadow-md shadow-rose-600/10 hover:shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>➕</span> Provision New Mess
        </button>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-2xl text-rose-600">🏢</div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Messes</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{data?.stats.totalMesses}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl text-emerald-600">👥</div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total SaaS Customers</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{data?.stats.totalCustomers}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl text-indigo-600">🛡️</div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Admins</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{data?.stats.totalAdmins}</p>
          </div>
        </div>
      </div>

      {/* Directory & User Mapping Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Directory Section */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50/70 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 text-lg">Active Workspaces ({filteredMesses.length})</h2>
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Search by mess name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10 placeholder:text-slate-400"
              />
              <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
            </div>
          </div>

          {/* Messes List */}
          {filteredMesses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-400 font-medium text-lg">No workspaces found</p>
              <p className="text-slate-400 text-sm mt-1">Try adapting your search queries or provision a new mess.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Mess Details</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-center">Pricing</th>
                    <th className="px-6 py-4 text-center">Stats</th>
                    <th className="px-6 py-4">Tenant Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMesses.map((mess) => (
                    <tr key={mess.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Mess Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold uppercase border border-slate-200">
                            {mess.shortName}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{mess.businessName}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{mess.phone} · {mess.supportEmail || "No Email"}</p>
                          </div>
                        </div>
                      </td>
                      {/* Location */}
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-slate-800">{mess.city}</p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[200px]" title={mess.address}>
                          {mess.address}
                        </p>
                      </td>
                      {/* Pricing */}
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="inline-flex gap-2.5 text-xs font-medium text-slate-600">
                          <span className="px-2 py-1 bg-slate-100 rounded-md">B: ₹{mess.breakfastPrice}</span>
                          <span className="px-2 py-1 bg-slate-100 rounded-md">L: ₹{mess.lunchPrice}</span>
                          <span className="px-2 py-1 bg-slate-100 rounded-md">D: ₹{mess.dinnerPrice}</span>
                        </div>
                      </td>
                      {/* Stats */}
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="flex justify-center gap-4">
                          <div className="text-center">
                            <p className="text-slate-800 font-semibold">{mess.customersCount}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Users</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-800 font-semibold">{mess.partnersCount}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Partners</p>
                          </div>
                        </div>
                      </td>
                      {/* Tenant Admin */}
                      <td className="px-6 py-4 text-sm">
                        {mess.admin ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{mess.admin.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{mess.admin.phone}</p>
                            <p className="text-rose-600 text-[11px] font-medium mt-0.5">{mess.admin.email || ""}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No Admin Configured</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Mapping Panel */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft flex flex-col justify-start h-fit space-y-4">
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">Map User to Mess</h2>
            <p className="text-slate-500 text-xs mt-0.5">Link a customer's registered phone number to a specific mess workspace.</p>
          </div>

          <form onSubmit={handleMapUser} className="space-y-4">
            {mapSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-fade-in">
                ✅ {mapSuccess}
              </div>
            )}
            {mapError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-fade-in">
                ⚠️ {mapError}
              </div>
            )}

            <div>
              <label className="admin-label">Registered Phone Number</label>
              <input
                type="text"
                required
                placeholder="e.g. +919876543211"
                value={mapPhone}
                onChange={(e) => setMapPhone(e.target.value)}
                className="admin-input py-2"
              />
            </div>

            <div>
              <label className="admin-label">Target Mess Workspace</label>
              <select
                required
                value={mapMessId}
                onChange={(e) => setMapMessId(e.target.value)}
                className="admin-input py-2 bg-white"
              >
                {data?.messes.map((mess) => (
                  <option key={mess.id} value={mess.id}>
                    {mess.businessName} ({mess.shortName})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={mapSubmitting || !mapMessId}
              className="w-full inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2.5 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-900/10"
            >
              {mapSubmitting ? "Linking..." : "Link User to Mess"}
            </button>
          </form>
        </div>
      </div>

      {/* Provision Mess Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Provision New Tenant Mess</h3>
                <p className="text-xs text-slate-500 mt-0.5">Creates a distinct database context, settings, and administrator.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddMess} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  ⚠️ {formError}
                </div>
              )}

              {/* Section 1: Mess Profile */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-3">🏢 Workspace Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Silver Plate Mess"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Short Code (Max 5 Chars)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="e.g. SPM"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Support Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +919876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Support Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. info@silverplate.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Location & Prices */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-3">📍 Geography & Base Pricing</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="admin-label">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kazhakkuttam Main Road"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thiruvananthapuram"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Latitude</label>
                    <input
                      type="text"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Longitude</label>
                    <input
                      type="text"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Breakfast Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={breakfastPrice}
                      onChange={(e) => setBreakfastPrice(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Lunch Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={lunchPrice}
                      onChange={(e) => setLunchPrice(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Dinner Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={dinnerPrice}
                      onChange={(e) => setDinnerPrice(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Admin Owner Account */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-3">🛡️ Workspace Administrator</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">Administrator Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adarsh Sen"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Administrator Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +919876543219"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Administrator Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. admin@silverplate.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Administrator Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn-secondary py-2.5 px-4"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary bg-rose-600 hover:bg-rose-700 py-2.5 px-6"
                  disabled={submitting}
                >
                  {submitting ? "Provisioning..." : "Provision Mess"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
