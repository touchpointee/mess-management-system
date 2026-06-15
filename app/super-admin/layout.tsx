"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const links = [
  { href: "/super-admin", label: "Messes Directory" },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (href: string) =>
    `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-rose-50 text-rose-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const handleSignOut = () => {
    signOut({ callbackUrl: window.location.origin + "/login" });
  };

  return (
    <div className="admin-shell flex min-h-screen flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:hidden flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-rose-600 uppercase">SaaS Panel</p>
          <p className="text-sm font-bold text-slate-900">Super Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="admin-btn-secondary px-3 py-2 text-xs"
        >
          Menu
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1200] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative h-full w-72 max-w-[80%] border-r border-slate-200 bg-white p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-wider text-rose-600 uppercase">SaaS Panel</p>
                <p className="text-lg font-bold text-slate-900">Super Admin Portal</p>
              </div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Navigation</p>
              <nav className="flex flex-col gap-1.5">
                {links.map(({ href, label }) => (
                  <Link key={href} href={href} className={linkClass(href)}>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="admin-btn-secondary w-full py-2.5"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden border-r border-slate-200 bg-white p-6 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:overflow-y-auto">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-wider text-rose-600 uppercase">SaaS Panel</p>
          <p className="text-xl font-bold text-slate-900">Super Admin</p>
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Navigation</p>
        <nav className="flex flex-col gap-1.5">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="admin-btn-secondary w-full py-2.5"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="w-full flex-1 lg:pl-64">
        {children}
      </div>
    </div>
  );
}
