"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { MessHeroCard } from "@/components/customer/MessHeroCard";

type MealsStatus = {
  B: { active: boolean };
  L: { active: boolean };
  D: { active: boolean };
};

export default function CustomerHomePage() {
  const [meals, setMeals] = useState<MealsStatus | null>(null);
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  useEffect(() => {
    fetch(`/api/customer/meals?date=${tomorrow}`)
      .then((r) => r.json())
      .then(setMeals)
      .catch(() => setMeals({ B: { active: false }, L: { active: false }, D: { active: false } }));
  }, [tomorrow]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="p-4">
        <MessHeroCard tomorrowMeals={meals} />
      </div>
    </div>
  );
}
