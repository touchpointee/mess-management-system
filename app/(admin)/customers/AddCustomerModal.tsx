"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CoordinatePickerModal } from "@/components/common/CoordinatePickerModal";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Min 6 characters"),
  address: z.string().optional(),
  lat: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" ? undefined : typeof v === "string" ? (v ? Number(v) : undefined) : v)),
  lng: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" ? undefined : typeof v === "string" ? (v ? Number(v) : undefined) : v)),
  startDate: z.string().optional(),
});

type FormData = z.output<typeof schema>;

type AddCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export function AddCustomerModal({
  open,
  onClose,
  onAdded,
}: AddCustomerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      address: "",
      startDate: "",
    },
  });
  const selectedLat = watch("lat");
  const selectedLng = watch("lng");

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        address: data.address || undefined,
        lat: data.lat,
        lng: data.lng,
        startDate: data.startDate || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? "Failed to add customer");
      return;
    }
    reset();
    onAdded();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Add Customer</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="admin-label">Name</label>
            <input {...register("name")} className="admin-input" />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="admin-label">Phone</label>
            <input {...register("phone")} className="admin-input" />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="admin-label">Email (optional)</label>
            <input {...register("email")} type="email" className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Password</label>
            <input {...register("password")} type="password" className="admin-input" />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="admin-label">Address (optional)</label>
            <input {...register("address")} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Customer location (optional)</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="admin-btn-secondary w-full"
              >
                {typeof selectedLat === "number" && typeof selectedLng === "number"
                  ? "Change location on map"
                  : "Select location on map"}
              </button>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="text-slate-500">Selected:</span>{" "}
                {typeof selectedLat === "number" && typeof selectedLng === "number" ? (
                  <span className="font-medium">
                    {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
              <input type="hidden" {...register("lat", { valueAsNumber: true })} />
              <input type="hidden" {...register("lng", { valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <label className="admin-label">Billing start date (optional)</label>
            <input {...register("startDate")} type="date" className="admin-input" />
            <p className="mt-1 text-xs text-slate-500">
              Meal charges apply from this date; payment cycle is every 30 days from here.
            </p>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button type="button" onClick={onClose} className="admin-btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary flex-1">
              Add
            </button>
          </div>
        </form>
      </div>

      <CoordinatePickerModal
        open={mapOpen}
        title="Select customer location"
        initial={
          typeof selectedLat === "number" && typeof selectedLng === "number"
            ? { lat: selectedLat, lng: selectedLng }
            : null
        }
        onClose={() => setMapOpen(false)}
        onConfirm={(coords) => {
          setValue("lat", coords.lat, { shouldDirty: true });
          setValue("lng", coords.lng, { shouldDirty: true });
        }}
      />
    </div>
  );
}
