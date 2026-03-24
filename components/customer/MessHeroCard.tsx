"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MealsStatus = {
  B: { active: boolean };
  L: { active: boolean };
  D: { active: boolean };
};

type SystemSettings = {
  businessName: string;
  shortName: string;
  phone: string;
  address: string;
  city: string;
  heroImageUrl: string | null;
};

type MessHeroCardProps = {
  tomorrowMeals: MealsStatus | null;
};

export function MessHeroCard({ tomorrowMeals }: MessHeroCardProps) {
  const [system, setSystem] = useState<SystemSettings | null>(null);

  useEffect(() => {
    fetch("/api/system")
      .then((res) => res.json())
      .then(setSystem)
      .catch(() => setSystem(null));
  }, []);

  const title = system?.businessName || "Mess Management System";
  const shortName = system?.shortName || "MESS";
  const location = [system?.address, system?.city].filter(Boolean).join(", ");
  const phoneHref = system?.phone ? `tel:${system.phone}` : undefined;
  const heroImage =
    system?.heroImageUrl ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200";

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[200px] flex flex-col shadow-soft animate-slide-up">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 backdrop-blur-[1px]" />
      <div className="relative z-10 m-3 flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg">
            <span className="text-[11px] font-bold text-white text-center leading-tight px-1.5">
              {shortName}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-xl">{title}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{location || "Configure mess details"}</p>
          </div>
          {phoneHref ? (
            <a
              href={phoneHref}
              className="w-14 h-14 rounded-2xl gradient-success flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Call"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </a>
          ) : null}
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
          <span className="text-gray-700 text-sm font-semibold">Your meals for tomorrow</span>
          {!tomorrowMeals ? <span className="text-xs text-gray-500">Loading...</span> : null}
          <div className="flex items-center gap-2">
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                tomorrowMeals?.B.active 
                  ? "gradient-success text-white shadow-md" 
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              B
            </span>
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                tomorrowMeals?.L.active 
                  ? "gradient-warning text-white shadow-md" 
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              L
            </span>
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                tomorrowMeals?.D.active 
                  ? "gradient-info text-white shadow-md" 
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              D
            </span>
          </div>
        </div>
        <Link
          href="/account#locations"
          className="block w-full py-3 gradient-primary text-white font-semibold rounded-2xl text-center text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          + Add Delivery Locations
        </Link>
      </div>
    </div>
  );
}
