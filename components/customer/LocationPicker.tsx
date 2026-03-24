"use client";

import { MealType } from "@/lib/constants";

export type LocationItem = {
  id: string;
  label: string;
  address: string;
  mealType: string;
  isDefault: boolean;
};

type LocationPickerProps = {
  open: boolean;
  onClose: () => void;
  mealType: string;
  locations: LocationItem[];
  onSelect: (locationId: string) => void;
  onSetDefault: (locationId: string) => void;
};

export function LocationPicker({
  open,
  onClose,
  mealType,
  locations,
  onSelect,
  onSetDefault,
}: LocationPickerProps) {
  if (!open) return null;
  const filtered = locations.filter((l) => l.mealType === mealType);
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full max-w-[430px] mx-auto max-h-[70vh] overflow-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="font-semibold">
            {mealType === MealType.BREAKFAST && "Breakfast"}
            {mealType === MealType.LUNCH && "Lunch"}
            {mealType === MealType.DINNER && "Dinner"} locations
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 p-2">
            Close
          </button>
        </div>
        <div className="p-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">No locations. Add one in Account.</p>
          ) : (
            filtered.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{loc.label}</p>
                  <p className="text-sm text-gray-500 truncate">{loc.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  {loc.isDefault && (
                    <span className="text-[#27AE60] text-sm">Default</span>
                  )}
                  {!loc.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(loc.id)}
                      className="text-sm text-[#C0392B]"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(loc.id);
                      onClose();
                    }}
                    className="text-sm bg-[#C0392B] text-white px-3 py-1 rounded"
                  >
                    Use
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
