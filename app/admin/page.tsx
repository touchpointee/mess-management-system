import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminIndexPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (role !== "ADMIN") {
    redirect("/admin/login");
  }

  redirect("/admin/dashboard");
}

