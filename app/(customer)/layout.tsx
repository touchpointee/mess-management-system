import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/customer/BottomNav";
import { SignOutButton } from "@/components/customer/SignOutButton";

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

  const messId = (session.user as { messId?: string }).messId;
  if (messId === "unmapped") {
    const userIdentifier = (session.user as { phone?: string }).phone || session.user.email || "";
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 flex flex-col items-center w-full">
          <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-5 border border-amber-100">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-3">Workspace Required</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Please contact your mess and inform them to add your number to their database.
          </p>
          <div className="w-full border-t border-slate-100 pt-5">
            {userIdentifier && (
              <p className="text-xs text-slate-400 mb-4 font-mono">
                Phone: {userIdentifier}
              </p>
            )}
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#F5F5F5]">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
