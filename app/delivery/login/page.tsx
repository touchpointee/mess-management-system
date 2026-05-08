"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export default function DeliveryLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role === "delivery_partner" || role === "ADMIN") {
      router.replace("/delivery/dashboard");
      return;
    }
    signOut({ redirect: false });
    setError("Delivery partner login required.");
  }, [router, session, status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await signIn("credentials", {
      login,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (res?.error) {
      if (res.error === "ACCOUNT_DISABLED") {
        setError("Your delivery partner account is disabled.");
        return;
      }
      setError("Invalid phone/email or password.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-center text-xl font-bold text-slate-900">
          Delivery Sign in
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Use the account created by admin.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone or Email
            </label>
            <input
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              placeholder="Phone or email"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
              placeholder="Password"
              type="password"
              required
            />
          </div>
          {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#C0392B] py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
