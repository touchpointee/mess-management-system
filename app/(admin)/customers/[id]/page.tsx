import Link from "next/link";
import { auth } from "@/lib/auth";
import { CustomerDetailClient } from "./CustomerDetailClient";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await auth();
  const { id } = await params;
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <Link
          href="/admin/customers"
          className="text-sm font-medium text-primary"
        >
          ← Back to Customers
        </Link>
        <h1 className="admin-title self-start sm:self-auto">Customer Detail</h1>
      </header>
      <CustomerDetailClient customerId={id} />
    </div>
  );
}
