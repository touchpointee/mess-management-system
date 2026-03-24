"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Min 6 characters"),
  address: z.string().optional(),
  lat: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" ? undefined : typeof v === "string" ? (v ? Number(v) : undefined) : v)),
  lng: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" ? undefined : typeof v === "string" ? (v ? Number(v) : undefined) : v)),
  monthlyFee: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" ? undefined : typeof v === "string" ? (v ? Number(v) : undefined) : v)).refine((v) => v === undefined || v >= 0, "Must be ≥ 0"),
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
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      address: "",
      monthlyFee: undefined,
      startDate: "",
    },
  });

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
        monthlyFee: data.monthlyFee,
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="admin-label">Lat</label>
              <input {...register("lat", { valueAsNumber: true })} type="number" step="any" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Lng</label>
              <input {...register("lng", { valueAsNumber: true })} type="number" step="any" className="admin-input" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="admin-label">Monthly fee (₹) - optional</label>
              <input {...register("monthlyFee", { valueAsNumber: true })} type="number" step="0.01" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Plan start date - optional</label>
              <input {...register("startDate")} type="date" className="admin-input" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Note: account balance is now calculated from booked meals and global meal prices.
          </p>
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
    </div>
  );
}
