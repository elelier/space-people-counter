"use client";
import { useEffect, useState } from "react";
import { getContinuousHumanPresenceYears } from "@/lib/continuousHumanPresence";

export function useContinuousHumanPresenceYears(): number | null {
  const [years, setYears] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setYears(getContinuousHumanPresenceYears());
    update();
    const interval = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);
  return years;
}
