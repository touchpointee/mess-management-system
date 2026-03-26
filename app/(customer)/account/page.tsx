"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { MealType } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { CoordinatePickerModal } from "@/components/common/CoordinatePickerModal";

type AccountData = {
  user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    startDate: string | null;
  };
  payments: { id: string; date: string; amount: number; note: string | null }[];
  cyclesCompleted: number;
  billableMealCount: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  dueAmount: number;
  advanceAmount: number;
  nextDueDate: string | null;
  locations: { id: string; label: string; address: string; mealType: string; isDefault: boolean }[];
};

const addLocationSchema = z.object({
  label: z.string().min(1, "Label required"),
  address: z.string().min(1, "Address required"),
  lat: z.number(),
  lng: z.number(),
  mealType: z.enum([MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER]),
  setAsDefault: z.boolean().optional(),
});

type AddLocationForm = z.infer<typeof addLocationSchema>;

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [addingMeal, setAddingMeal] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AddLocationForm>({
    resolver: zodResolver(addLocationSchema),
    defaultValues: { mealType: MealType.BREAKFAST, setAsDefault: false },
  });
  const selectedLat = watch("lat");
  const selectedLng = watch("lng");

  useEffect(() => {
    if (addingMeal) setValue("mealType", addingMeal as "BREAKFAST" | "LUNCH" | "DINNER");
  }, [addingMeal, setValue]);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/customer/account")
      .then(async (r) => {
        if (r.status === 401) {
          await signOut({ redirect: false });
          router.replace("/login?callbackUrl=/account");
          return null;
        }
        return r.json();
      })
      .then((json) => json && setData(json));
  }, [router]);

  const onAddLocation = async (form: AddLocationForm) => {
    setSubmitting(true);
    setError(null);
    try {
      const saveRes = await fetch("/api/customer/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label,
          address: form.address,
          lat: form.lat,
          lng: form.lng,
          mealType: form.mealType,
          setAsDefault: form.setAsDefault,
        }),
      });
      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to add location");
      }
      const res = await fetch("/api/customer/account");
      const next = await res.json();
      setData(next);
      setAddingMeal(null);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add location");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLocation = async (id: string) => {
    await fetch(`/api/customer/locations?id=${id}`, { method: "DELETE" });
    const res = await fetch("/api/customer/account");
    setData(await res.json());
  };

  const setDefaultLocation = async (id: string) => {
    await fetch("/api/customer/locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, setAsDefault: true }),
    });
    const res = await fetch("/api/customer/account");
    setData(await res.json());
  };

  if (!data) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const mealLabels: Record<string, string> = {
    [MealType.BREAKFAST]: "Breakfast",
    [MealType.LUNCH]: "Lunch",
    [MealType.DINNER]: "Dinner",
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
      ) : null}
      <div className="bg-white rounded-card shadow-card p-4">
        <h2 className="font-semibold mb-3">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
          <div>
            <p className="font-medium">{data.user.name}</p>
            <p className="text-gray-600 text-sm">{data.user.phone}</p>
            {data.user.email && (
              <p className="text-gray-600 text-sm">{data.user.email}</p>
            )}
            {data.user.address && (
              <p className="text-gray-500 text-sm mt-1">{data.user.address}</p>
            )}
          </div>
        </div>
      </div>

      <div id="locations" className="bg-white rounded-card shadow-card p-4">
        <h2 className="font-semibold mb-3">My Delivery Locations</h2>
        {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map((meal) => {
          const locs = data.locations.filter((l) => l.mealType === meal);
          const open = addingMeal === meal;
          return (
            <div key={meal} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">{mealLabels[meal]}</h3>
                <button
                  type="button"
                  onClick={() => setAddingMeal(open ? null : meal)}
                  className="text-[#C0392B] text-sm"
                >
                  {open ? "Cancel" : "+ Add Location"}
                </button>
              </div>
              {locs.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{loc.label}</p>
                    <p className="text-sm text-gray-500 truncate">{loc.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {loc.isDefault ? (
                      <span className="text-[#27AE60] text-sm">★ Default</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDefaultLocation(loc.id)}
                        className="text-sm text-[#C0392B]"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteLocation(loc.id)}
                      className="text-red-600 p-1"
                      aria-label="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
              {open && (
                <form
                  onSubmit={handleSubmit(onAddLocation)}
                  className="mt-2 p-3 border rounded-lg space-y-2"
                >
                  <input
                    {...register("label")}
                    placeholder="Label (e.g. Home)"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  {errors.label && <p className="text-red-600 text-xs">{errors.label.message}</p>}
                  <input
                    {...register("address")}
                    placeholder="Address"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  {errors.address && <p className="text-red-600 text-xs">{errors.address.message}</p>}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setMapOpen(true)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {typeof selectedLat === "number" && typeof selectedLng === "number"
                        ? "Change location on map"
                        : "Select location on map"}
                    </button>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="text-gray-500">Selected:</span>{" "}
                      {typeof selectedLat === "number" && typeof selectedLng === "number" ? (
                        <span className="font-medium">
                          {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    <input type="hidden" {...register("lat", { valueAsNumber: true })} />
                    <input type="hidden" {...register("lng", { valueAsNumber: true })} />
                  </div>
                  {(errors.lat || errors.lng) && (
                    <p className="text-red-600 text-xs">Please select a location on map.</p>
                  )}
                  <input type="hidden" {...register("mealType")} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register("setAsDefault")} />
                    Set as default
                  </label>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-[#C0392B] text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-card shadow-card p-4">
        <h2 className="font-semibold mb-3">Payment & Account Summary</h2>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-gray-500">30-day cycles</p>
            <p className="font-semibold">{data.cyclesCompleted}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-gray-500">Billable meals</p>
            <p className="font-semibold">{data.billableMealCount}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 col-span-2">
            <p className="text-gray-500">Total due (meal prices)</p>
            <p className="font-semibold">{formatCurrency(data.totalDue)}</p>
          </div>
        </div>
        {data.payments.length === 0 ? (
          <p className="text-gray-500 text-sm">No payments yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.payments.map((p) => (
              <li key={p.id} className="flex justify-between items-center">
                <span className="text-sm">{format(new Date(p.date), "dd MMM yyyy")}</span>
                <span className="font-medium">{formatCurrency(p.amount)}</span>
                <span className="text-[#27AE60]">✓</span>
              </li>
            ))}
          </ul>
        )}
        <p className="font-medium mt-3 text-[#27AE60]">
          Total paid: {formatCurrency(data.totalPaid)}
        </p>
        {data.dueAmount > 0 ? (
          <p className="font-semibold text-red-600">Due amount: {formatCurrency(data.dueAmount)}</p>
        ) : data.advanceAmount > 0 ? (
          <p className="font-semibold text-[#27AE60]">Advance/credit: {formatCurrency(data.advanceAmount)}</p>
        ) : (
          <p className="font-semibold text-gray-600">Account settled</p>
        )}
      </div>

      <div className="bg-white rounded-card shadow-card p-4">
        <h2 className="font-semibold mb-3">Billing</h2>
        <p className="text-sm text-gray-600">
          Charges use meal prices set by the mess. Meals on leave are not charged. Billing runs from your start date;
          payment is due every 30 days.
        </p>
        <p className="text-sm mt-2">
          <span className="text-gray-500">Billing start: </span>
          {data.user.startDate
            ? format(new Date(data.user.startDate), "dd MMM yyyy")
            : "—"}
        </p>
        {data.nextDueDate ? (
          <p className="text-sm mt-1">
            <span className="text-gray-500">Next due window: </span>
            {format(new Date(data.nextDueDate), "dd MMM yyyy")}
          </p>
        ) : null}
      </div>

      <div className="bg-white rounded-card shadow-card p-4">
        <h2 className="font-semibold mb-3">Session</h2>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:opacity-90"
        >
          Logout
        </button>
      </div>

      <CoordinatePickerModal
        open={mapOpen}
        title="Select delivery location"
        initial={
          typeof selectedLat === "number" && typeof selectedLng === "number"
            ? { lat: selectedLat, lng: selectedLng }
            : null
        }
        onClose={() => setMapOpen(false)}
        onConfirm={(coords) => {
          setValue("lat", coords.lat, { shouldDirty: true, shouldValidate: true });
          setValue("lng", coords.lng, { shouldDirty: true, shouldValidate: true });
        }}
      />
    </div>
  );
}
