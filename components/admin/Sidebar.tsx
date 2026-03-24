"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/delivery-map", label: "Delivery Map" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [businessName, setBusinessName] = useState("Admin Portal");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/system")
      .then((res) => res.json())
      .then((data) => {
        setBusinessName(data.businessName || "Admin Portal");
      })
      .catch(() => setBusinessName("Admin Portal"));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const linkClass = (href: string) =>
    `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-primary-soft text-primary"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Admin</p>
            <p className="text-sm font-semibold text-slate-900">{businessName}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="admin-btn-secondary px-3 py-2 text-xs"
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative h-full w-72 max-w-[80%] border-r border-slate-200 bg-white p-4 shadow-xl">
            <p className="mb-5 text-lg font-semibold text-slate-900">{businessName}</p>
            <nav className="flex flex-col gap-1.5">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className={linkClass(href)}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="admin-btn-secondary w-full"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <aside className="hidden border-r border-slate-200 bg-white p-5 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:overflow-y-auto">
        <p className="mb-6 text-lg font-semibold text-slate-900">{businessName}</p>
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
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="admin-btn-secondary w-full"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
