import Link from "next/link";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  planFee: number | null;
  startDate: string | null;
  daysActive: number;
  balanceDue: number;
  dueAmount: number;
  advanceAmount: number;
};

type CustomerTableProps = {
  customers: CustomerRow[];
  search: string;
  onSearchChange: (v: string) => void;
};

export function CustomerTable({
  customers,
  search,
  onSearchChange,
}: CustomerTableProps) {
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="admin-input flex-1 sm:max-w-md"
        />
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Plan Fee</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Start Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Days Active</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Account Balance</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                <td className="px-4 py-3">
                  {c.planFee != null ? formatCurrency(c.planFee) : "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {c.startDate ? format(new Date(c.startDate), "dd MMM yyyy") : "-"}
                </td>
                <td className="px-4 py-3">{c.daysActive}</td>
                <td className="px-4 py-3">
                  {c.dueAmount > 0 ? (
                    <span className="text-red-600 font-medium">
                      Due: {formatCurrency(c.dueAmount)}
                    </span>
                  ) : c.advanceAmount > 0 ? (
                    <span className="font-medium text-emerald-600">
                      Advance: {formatCurrency(c.advanceAmount)}
                    </span>
                  ) : (
                    <span className="text-slate-500">Settled</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="text-sm font-medium text-primary"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  No customers found for this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {filtered.map((c) => (
          <div key={c.id} className="admin-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{c.name}</p>
                <p className="text-sm text-slate-600">{c.phone}</p>
              </div>
              <Link href={`/admin/customers/${c.id}`} className="text-sm font-medium text-primary">
                View
              </Link>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>Plan Fee: {c.planFee != null ? formatCurrency(c.planFee) : "-"}</p>
              <p>Start Date: {c.startDate ? format(new Date(c.startDate), "dd MMM yyyy") : "-"}</p>
              <p>Days Active: {c.daysActive}</p>
              <p>
                Balance:{" "}
                {c.dueAmount > 0
                  ? `Due ${formatCurrency(c.dueAmount)}`
                  : c.advanceAmount > 0
                    ? `Advance ${formatCurrency(c.advanceAmount)}`
                    : "Settled"}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <div className="admin-card text-sm text-slate-500">No customers found for this search.</div>
        ) : null}
      </div>
    </div>
  );
}
