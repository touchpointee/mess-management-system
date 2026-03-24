"use client";

import { FormEvent, useEffect, useState } from "react";

type SystemSettingsRes = {
  businessName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
};

export default function AdminSettingsPage() {
  const [businessName, setBusinessName] = useState("Mess");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [breakfastPrice, setBreakfastPrice] = useState("");
  const [lunchPrice, setLunchPrice] = useState("");
  const [dinnerPrice, setDinnerPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/system")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return (await res.json()) as SystemSettingsRes;
      })
      .then((data) => {
        setBusinessName(data.businessName || "Mess");
        setAddress(data.address || "");
        setCity(data.city || "");
        setLat(String(data.lat ?? ""));
        setLng(String(data.lng ?? ""));
        setBreakfastPrice(String(data.breakfastPrice ?? ""));
        setLunchPrice(String(data.lunchPrice ?? ""));
        setDinnerPrice(String(data.dinnerPrice ?? ""));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload = {
      businessName: businessName.trim(),
      address: address.trim(),
      city: city.trim(),
      lat: Number(lat),
      lng: Number(lng),
      breakfastPrice: Number(breakfastPrice),
      lunchPrice: Number(lunchPrice),
      dinnerPrice: Number(dinnerPrice),
    };
    try {
      const res = await fetch("/api/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message ?? "Failed to save location");
      }
      setBusinessName(body?.businessName ?? businessName);
      setSuccess("Mess settings updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Settings</h1>
          <p className="admin-subtitle">Configure business location used for routing.</p>
        </div>
      </header>
      <div className="max-w-2xl">
        <div className="admin-card">
          <h2 className="font-semibold text-slate-900">Mess Location</h2>
          <p className="mt-1 text-sm text-slate-500">
            Delivery route starts from this location for all map calculations.
          </p>

          {loading ? <p className="mt-4 text-sm text-slate-500">Loading settings...</p> : null}

          {!loading ? (
            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="admin-label">Mess Name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="admin-input"
                  placeholder="Enter mess name"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="admin-input"
                  placeholder="Enter mess address"
                  required
                />
              </div>

              <div>
                <label className="admin-label">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="admin-input"
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="admin-input"
                  placeholder="8.5600"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="admin-input"
                  placeholder="76.8800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="admin-label">Breakfast Price (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={breakfastPrice}
                    onChange={(e) => setBreakfastPrice(e.target.value)}
                    className="admin-input"
                    placeholder="60"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Lunch Price (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lunchPrice}
                    onChange={(e) => setLunchPrice(e.target.value)}
                    className="admin-input"
                    placeholder="90"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Dinner Price (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dinnerPrice}
                    onChange={(e) => setDinnerPrice(e.target.value)}
                    className="admin-input"
                    placeholder="80"
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="admin-btn-primary"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
