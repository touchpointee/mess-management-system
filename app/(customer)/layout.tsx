import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/customer/BottomNav";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#F5F5F5]">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
