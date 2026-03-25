"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  login: z.string().min(1, "Phone or email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = searchParams.get("callbackUrl");
  const adminOnly = searchParams.get("admin") === "1";

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (adminOnly && role !== "ADMIN") {
      setError("Admin login required. Please use an admin account.");
      signOut({ redirect: false });
      return;
    }
    if (callbackUrl) {
      if (callbackUrl.startsWith("/admin") && role !== "ADMIN") {
        router.replace("/overview");
      } else {
        router.replace(callbackUrl);
      }
      return;
    }
    if (role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/overview");
    }
  }, [session, status, router, callbackUrl, adminOnly]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { login: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const res = await signIn("credentials", {
      login: data.login,
      password: data.password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid phone/email or password.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-xl font-bold text-center mb-2">
          {adminOnly ? "Admin Sign in" : "Sign in"}
        </h1>
        {adminOnly ? (
          <p className="text-center text-sm text-gray-500 mb-6">
            Use admin credentials to access the admin portal.
          </p>
        ) : (
          <div className="mb-6" />
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone or Email
            </label>
            <input
              {...register("login")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Phone or email"
            />
            {errors.login && (
              <p className="text-red-600 text-sm mt-1">{errors.login.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#C0392B] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {!adminOnly ? (
          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-[#C0392B] font-medium">
              Register
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
          <div className="text-gray-500 text-sm">Loading…</div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
