"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  login: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { login: "", password: "" },
  });

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }
    setError("Admin account required.");
    signOut({ redirect: false });
  }, [session, status, router]);

  async function onSubmit(data: FormData) {
    setError(null);
    const res = await signIn("credentials", {
      login: data.login,
      password: data.password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid admin credentials.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-xl font-bold text-center mb-2">Admin Sign in</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Login with admin credentials to access portal.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
            <input
              {...register("login")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="admin email or phone"
            />
            {errors.login ? <p className="text-red-600 text-sm mt-1">{errors.login.message}</p> : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Password"
            />
            {errors.password ? <p className="text-red-600 text-sm mt-1">{errors.password.message}</p> : null}
          </div>
          {error ? <p className="text-red-600 text-sm text-center">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#C0392B] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

