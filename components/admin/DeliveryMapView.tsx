"use client";

import { useEffect, useMemo, useRef } from "react";

type Stop = {
  stopNumber: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceFromPrev: number;
};

type DeliveryMapViewProps = {
  route: Stop[];
  totalDistanceKm: number;
  mealType: string;
  mess: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
};

const polylineColors: Record<string, string> = {
  BREAKFAST: "#f97316",
  LUNCH: "#22c55e",
  DINNER: "#3b82f6",
};

const isValidCoordinate = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

export function DeliveryMapView({
  route,
  totalDistanceKm,
  mealType,
  mess,
}: DeliveryMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mealLabel = mealType.charAt(0) + mealType.slice(1).toLowerCase();
  const validRoute = useMemo(
    () => route.filter((stop) => isValidCoordinate(stop.lat, stop.lng)),
    [route]
  );
  const canOpenMaps = isValidCoordinate(mess.lat, mess.lng) && validRoute.length > 0;

  const openInMapsUrl = useMemo(() => {
    if (!canOpenMaps) return null;
    const destinationStop = validRoute[validRoute.length - 1];
    const waypoints = validRoute
      .slice(0, -1)
      .map((stop) => `${stop.lat},${stop.lng}`)
      .join("|");
    const params = new URLSearchParams({
      api: "1",
      origin: `${mess.lat},${mess.lng}`,
      destination: `${destinationStop.lat},${destinationStop.lng}`,
      travelmode: "driving",
    });
    if (waypoints) {
      params.set("waypoints", waypoints);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [canOpenMaps, mess.lat, mess.lng, validRoute]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (!isValidCoordinate(mess.lat, mess.lng)) return;
    const L = require("leaflet");
    const map = L.map(mapRef.current).setView([mess.lat, mess.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
    const messIcon = L.divIcon({
      className: "custom-marker",
      html: "<div style='background:#C0392B;width:24px;height:24px;border-radius:50%;border:2px solid white;'></div>",
      iconSize: [24, 24],
    });
    const customerIcon = L.divIcon({
      className: "custom-marker",
      html: "<div style='display:flex;align-items:center;justify-content:center;background:#2563EB;width:26px;height:26px;border-radius:50%;border:2px solid white;color:white;font-size:14px;line-height:1;'>👤</div>",
      iconSize: [26, 26],
    });
    L.marker([mess.lat, mess.lng], { icon: messIcon })
      .addTo(map)
      .bindPopup(`Start: ${mess.name}`);
    const points: [number, number][] = [
      [mess.lat, mess.lng],
      ...validRoute.map((s) => [s.lat, s.lng] as [number, number]),
    ];
    if (points.length > 1) {
      L.polyline(points, { color: polylineColors[mealType] ?? "#666", weight: 4 }).addTo(map);
      map.fitBounds(points, { padding: [30, 30] });
    }
    validRoute.forEach((s) => {
      L.marker([s.lat, s.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>${s.stopNumber}. ${s.name}</b><br/>${s.address}`);
    });
    return () => {
      map.remove();
    };
  }, [validRoute, mealType, mess]);

  return (
    <div className="space-y-4">
      <div
        ref={mapRef}
        className="h-[320px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-[420px]"
      />
      <div className="admin-card">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold">Ordered Stops</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {mealLabel} route
            </span>
            {openInMapsUrl ? (
              <a
                href={openInMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-200"
              >
                Open Route in Maps
              </a>
            ) : null}
          </div>
        </div>
        <ul className="space-y-2">
          <li className="text-sm text-slate-600">
            0. {mess.name} (Start)
          </li>
          {validRoute.map((s) => (
            <li key={s.stopNumber} className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-3">
              <span className="break-words">
                {s.stopNumber}. {s.name} — {s.address}
              </span>
              <span className="text-slate-500 sm:shrink-0">{s.distanceFromPrev.toFixed(2)} km</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 font-medium text-slate-700">
          Total route distance: {totalDistanceKm.toFixed(2)} km
        </p>
      </div>
    </div>
  );
}
