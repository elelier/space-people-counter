"use client";

import { useCallback, useState } from "react";
import type { SpaceData } from "@/services/spaceApi";
import { PersonasEnEspacio } from "./PersonasEnEspacio";
import { MisionesActivas } from "./MisionesActivas";

export function SpacePeopleSections({ initialData }: { initialData: SpaceData }) {
  const [currentData, setCurrentData] = useState(initialData);
  const handleDataChange = useCallback((updated: SpaceData) => setCurrentData(updated), []);

  return (
    <>
      <PersonasEnEspacio initialData={initialData} onDataChange={handleDataChange} />
      <div id="misiones" className="scroll-mt-20">
        <MisionesActivas astronautas={currentData} />
      </div>
    </>
  );
}
