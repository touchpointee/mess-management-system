"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { MealType } from "@/lib/constants";

type Order = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  address: string;
  lat: number;
  lng: number;
  stopNumber: number;
  distanceFromPrev: number;
  status: string;
  deliveredAt: string | null;
};

type OrdersRes = {
  orders: Order[];
  totalDistanceKm: number;
  mess: { name: string; address: string; lat: number; lng: number };
};

const mealLabel: Record<string, string> = {
  [MealType.BREAKFAST]: "Breakfast",
  [MealType.LUNCH]: "Lunch",
  [MealType.DINNER]: "Dinner",
};

function DeliveryMap({ data, meal }: { data: OrdersRes; meal: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const openMapsUrl = useMemo(() => {
    const pending = data.orders.filter((order) => order.status !== "delivered");
    if (!pending.length) return null;
    const destination = pending[pending.length - 1];
    const waypoints = pending
      .slice(0, -1)
      .map((order) => `${order.lat},${order.lng}`)
      .join("|");
    const params = new URLSearchParams({
      api: "1",
      origin: `${data.mess.lat},${data.mess.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      travelmode: "driving",
    });
    if (waypoints) params.set("waypoints", waypoints);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [data]);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    const L = require("leaflet");
    const map = L.map(mapRef.current, {
      markerZoomAnimation: false,
      zoomAnimation: false,
    }).setView([data.mess.lat, data.mess.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
    mapInstanceRef.current = map;
    routeLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.stop();
      map.remove();
      mapInstanceRef.current = null;
      routeLayerRef.current = null;
    };
  }, [data.mess.lat, data.mess.lng]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer || typeof window === "undefined") return;
    const L = require("leaflet");

    routeLayer.clearLayers();

    const startIcon = L.divIcon({
      className: "delivery-start-marker",
      html: "<div style=\"display:flex;align-items:center;justify-content:center;background:#C0392B;width:30px;height:30px;border-radius:9999px;border:3px solid white;box-shadow:0 6px 18px rgba(0,0,0,0.25);color:white;font-size:14px;font-weight:700;\">S</div>",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([data.mess.lat, data.mess.lng], { icon: startIcon })
      .addTo(routeLayer)
      .bindPopup(`Start: ${data.mess.name}`);
    const points: [number, number][] = [
      [data.mess.lat, data.mess.lng],
      ...data.orders.map((order) => [order.lat, order.lng] as [number, number]),
    ];
    if (points.length > 1) {
      L.polyline(points, {
        color: meal === MealType.BREAKFAST ? "#f97316" : meal === MealType.LUNCH ? "#22c55e" : "#3b82f6",
        weight: 4,
      }).addTo(routeLayer);
      map.fitBounds(points, { padding: [24, 24], animate: false });
    }
    data.orders.forEach((order) => {
      const bg = order.status === "delivered" ? "#16a34a" : "#2563eb";
      const icon = L.divIcon({
        className: "delivery-marker",
        html: `<div style="display:flex;align-items:center;justify-content:center;background:${bg};width:28px;height:28px;border-radius:9999px;border:2px solid white;color:white;font-size:12px;font-weight:700;">${order.stopNumber}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([order.lat, order.lng], { icon })
        .addTo(routeLayer)
        .bindPopup(`<b>${order.stopNumber}. ${order.customerName}</b><br/>${order.address}`);
    });
  }, [data, meal]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div ref={mapRef} className="h-[300px] w-full bg-slate-100" />
      <div className="flex items-center justify-between gap-3 p-3 text-sm">
        <span className="font-medium text-slate-700">
          {data.totalDistanceKm.toFixed(2)} km route
        </span>
        {openMapsUrl ? (
          <a
            href={openMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-900 px-3 py-2 text-white"
          >
            Open Maps
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function DeliveryDashboardPage() {
  const [meal, setMeal] = useState<string>(MealType.BREAKFAST);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<OrdersRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch(`/api/delivery/orders?meal=${meal}&date=${date}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? "Failed to load orders");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const intervalId = window.setInterval(fetchOrders, 5000);
    return () => window.clearInterval(intervalId);
  }, [meal, date]);

  async function markDelivered(id: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/delivery/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchOrders();
    } catch {
      setError("Could not mark order delivered.");
    } finally {
      setBusy(null);
    }
  }

  const pendingCount = data?.orders.filter((order) => order.status !== "delivered").length ?? 0;

  return (
    <div className="mx-auto min-h-screen max-w-[430px] bg-[#F5F5F5] pb-6">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Delivery</h1>
            <p className="text-sm text-slate-500">{pendingCount} pending orders</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/delivery/login" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            Logout
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Object.values(MealType).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMeal(item)}
              className={`rounded-xl px-2 py-2 text-sm font-medium ${
                meal === item ? "bg-[#C0392B] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {mealLabel[item]}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </header>

      <main className="space-y-4 p-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading orders...</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : data ? (
          <>
            <DeliveryMap data={data} meal={meal} />
            <div className="space-y-3">
              {data.orders.map((order) => (
                <div key={order.id} className="rounded-2xl bg-white p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {order.stopNumber}. {order.customerName}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{order.address}</p>
                      {order.customerPhone ? (
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="mt-2 inline-flex text-sm font-medium text-[#C0392B]"
                        >
                          {order.customerPhone}
                        </a>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status === "delivered" ? "Delivered" : "Pending"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">
                      {order.distanceFromPrev.toFixed(2)} km from previous
                    </span>
                    {order.status === "delivered" ? (
                      <span className="text-xs text-slate-500">
                        {order.deliveredAt
                          ? format(new Date(order.deliveredAt), "h:mm a")
                          : ""}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markDelivered(order.id)}
                        disabled={busy === order.id}
                        className="rounded-lg bg-[#27AE60] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {busy === order.id ? "Saving..." : "Mark Delivered"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {data.orders.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-card">
                  No assigned orders for this meal and date.
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
