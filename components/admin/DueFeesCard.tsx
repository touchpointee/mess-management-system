import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type DueFeesCardProps = {
  id: string;
  name: string;
  phone: string;
  bookedMeals: number;
  totalDue: number;
  totalPaid: number;
  dueAmount: number;
  onCollectPayment: () => void;
};

export function DueFeesCard({
  id,
  name,
  phone,
  bookedMeals,
  totalDue,
  totalPaid,
  dueAmount,
  onCollectPayment,
}: DueFeesCardProps) {
  return (
    <div className="admin-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{phone}</p>
        </div>
        <Link
          href={`/admin/customers/${id}`}
          className="text-sm font-medium text-primary sm:self-auto"
        >
          View
        </Link>
      </div>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p className="break-words">Booked meals: {bookedMeals}</p>
        <p>Total Due: {formatCurrency(totalDue)}</p>
        <p className="text-emerald-600">Total Paid: {formatCurrency(totalPaid)}</p>
        <p className="font-bold text-red-600">Due: {formatCurrency(dueAmount)}</p>
      </div>
      <button
        type="button"
        onClick={onCollectPayment}
        className="admin-btn-primary mt-3 w-full"
      >
        Collect Payment
      </button>
    </div>
  );
}
