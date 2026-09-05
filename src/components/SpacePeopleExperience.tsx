"use client";

import { useCallback, useEffect, useState } from "react";
import { getPeopleInSpace, SpaceData } from "@/services/spaceApi";
import { PersonasEnEspacio } from "@/components/PersonasEnEspacio";
import { MisionesActivas } from "@/components/MisionesActivas";

const AUTO_UPDATE_INTERVAL = 5 * 60 * 1000;

type WindowWithGtag = Window & {
  gtag?: (...args: unknown[]) => void;
};

export function SpacePeopleExperience() {
  const [data, setData] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (manual = false) => {
    if (manual && typeof window !== "undefined") {
      (window as WindowWithGtag).gtag?.("event", "manual_refresh");
    }

    setLoading(true);
    const nextData = await getPeopleInSpace(manual);
    setData(nextData);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();

    const interval = window.setInterval(() => {
      void fetchData();
    }, AUTO_UPDATE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      <PersonasEnEspacio
        data={data}
        loading={loading}
        onRefresh={() => void fetchData(true)}
      />

      <div id="misiones" className="scroll-mt-24">
        <MisionesActivas astronautas={data} loading={loading} />
      </div>
    </div>
  );
}
