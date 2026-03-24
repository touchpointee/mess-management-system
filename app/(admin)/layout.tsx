import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    redirect("/admin/login");
  }
  return (
    <div className="admin-shell flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="w-full flex-1 lg:pl-64">{children}</div>
    </div>
  );
}
