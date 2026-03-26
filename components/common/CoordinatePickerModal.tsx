"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

export type Coordinates = { lat: number; lng: number };

type CoordinatePickerModalProps = {
  open: boolean;
  title?: string;
  initial?: Coordinates | null;
  onClose: () => void;
  onConfirm: (coords: Coordinates) => void;
  confirmLabel?: string;
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function isValidCoordinate(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function CoordinatePickerModal({
  open,
  title = "Select location",
  initial,
  onClose,
  onConfirm,
  confirmLabel = "Use this location",
}: CoordinatePickerModalProps) {
  const initialValid =
    initial && isValidCoordinate(initial.lat, initial.lng) ? initial : null;

  const [picked, setPicked] = useState<Coordinates | null>(initialValid);
  const [center, setCenter] = useState<Coordinates>(
    initialValid ?? { lat: 20.5937, lng: 78.9629 } // India (sane default)
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported in this browser.");
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        if (isValidCoordinate(coords.lat, coords.lng)) {
          setCenter(coords);
          setPicked(coords);
          return;
        }
        setLocationError("Could not detect a valid current location.");
      },
      () => {
        setLocationError("Please allow location access to use current location.");
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
    );
  };

  useEffect(() => {
    if (!open) return;
    const nextInitial =
      initial && isValidCoordinate(initial.lat, initial.lng) ? initial : null;
    setPicked(nextInitial);
    if (nextInitial) {
      setCenter(nextInitial);
    }
    setSearchText("");
    setSearchResults([]);
    locateCurrentPosition();
  }, [open, initial?.lat, initial?.lng]);

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;
    setSearching(true);
    setLocationError(null);
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        q: query,
        limit: "5",
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Search failed");
      }
      const data = (await res.json()) as SearchResult[];
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setLocationError("Unable to search location right now. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!open || !mapRef.current || typeof window === "undefined") return;
    const L = require("leaflet");
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: "coordinate-picker-marker",
      html: "<div style='background:#C0392B;width:28px;height:28px;border-radius:9999px;border:3px solid white;box-shadow:0 6px 18px rgba(0,0,0,0.25);'></div>",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    let marker: any = null;
    const putMarker = (coords: Coordinates) => {
      if (!marker) {
        marker = L.marker([coords.lat, coords.lng], {
          icon: markerIcon,
          draggable: true,
        }).addTo(map);
        marker.on("dragend", () => {
          const ll = marker.getLatLng();
          setPicked({ lat: ll.lat, lng: ll.lng });
        });
      } else {
        marker.setLatLng([coords.lat, coords.lng]);
      }
      map.panTo([coords.lat, coords.lng], { animate: true });
    };

    if (selected) {
      putMarker(selected);
    }

    const onMapClick = (event: any) => {
      const coords = { lat: event.latlng.lat, lng: event.latlng.lng };
      setPicked(coords);
      putMarker(coords);
    };
    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      map.remove();
    };
  }, [open, center.lat, center.lng]);

  if (!open) return null;
  const selected = picked ?? initialValid;
  const canConfirm = !!selected && isValidCoordinate(selected.lat, selected.lng);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Click on the map to choose a point.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="space-y-2 border-b p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={locateCurrentPosition}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Use current location
            </button>
            <form onSubmit={onSearch} className="flex flex-1 gap-2">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search place or address"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={searching || !searchText.trim()}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {searching ? "..." : "Search"}
              </button>
            </form>
          </div>
          {searchResults.length > 0 ? (
            <div className="max-h-28 space-y-1 overflow-auto rounded-lg border border-slate-200 p-2">
              {searchResults.map((result, idx) => (
                <button
                  key={`${result.lat}-${result.lon}-${idx}`}
                  type="button"
                  onClick={() => {
                    const lat = Number(result.lat);
                    const lng = Number(result.lon);
                    if (!isValidCoordinate(lat, lng)) return;
                    const coords = { lat, lng };
                    setCenter(coords);
                    setPicked(coords);
                  }}
                  className="w-full rounded px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          ) : null}
          {locationError ? (
            <p className="text-xs text-amber-700">{locationError}</p>
          ) : null}
        </div>

        <div className="h-[360px] w-full bg-slate-100">
          <div ref={mapRef} className="h-full w-full" />
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            <span className="text-slate-500">Selected:</span>{" "}
            {canConfirm ? (
              <span className="font-medium">
                {selected!.lat.toFixed(6)}, {selected!.lng.toFixed(6)}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => {
                if (!selected) return;
                onConfirm(selected);
                onClose();
              }}
              className="rounded-xl bg-[#C0392B] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

