"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full py-2.5 bg-[#C0392B] text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition"
    >
      Sign Out
    </button>
  );
}
