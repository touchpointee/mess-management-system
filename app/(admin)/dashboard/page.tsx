import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { DashboardData } from "./DashboardData";

export default async function AdminDashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Admin";
  const today = format(new Date(), "EEEE, d MMMM yyyy");
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-subtitle">
            Overview for operations and customer deliveries.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Today, {today} · {name}
        </p>
      </header>
      <DashboardData />
    </div>
  );
}
