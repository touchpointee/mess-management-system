"use client";

import { useEffect, useState } from "react";

type SystemSettings = {
  businessName: string;
  phone: string;
  address: string;
  city: string;
  heroImageUrl: string | null;
};

export function MessHeader() {
  const [system, setSystem] = useState<SystemSettings | null>(null);

  useEffect(() => {
    fetch("/api/system")
      .then((res) => res.json())
      .then(setSystem)
      .catch(() => setSystem(null));
  }, []);

  const title = system?.businessName || "Mess Management System";
  const location = [system?.address, system?.city].filter(Boolean).join(", ");
  const phoneHref = system?.phone ? `tel:${system.phone}` : undefined;
  const heroImage =
    system?.heroImageUrl ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-800 min-h-[140px] flex items-end p-4">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="relative z-10 flex items-center gap-4 w-full">
        <div className="w-14 h-14 rounded-xl bg-[#C0392B] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-lg">{title}</h1>
          <p className="text-gray-200 text-sm">{location || "Configure mess details"}</p>
        </div>
        {phoneHref ? (
          <a
            href={phoneHref}
            className="w-12 h-12 rounded-xl bg-[#27AE60] flex items-center justify-center flex-shrink-0"
            aria-label="Call"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </a>
        ) : null}
      </div>
    </div>
  );
}
