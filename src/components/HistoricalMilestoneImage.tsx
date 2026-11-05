"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { HistoricalMilestone } from "@/services/historicalAstronautData";

export function HistoricalMilestoneImage({ milestone }: { milestone: HistoricalMilestone }) {
  const [hasError, setHasError] = useState(false);
  const filename = milestone.image?.split("/").pop()?.replace(/^\d+px-/, "");
  const sourcePage = filename
    ? `https://commons.wikimedia.org/wiki/File:${filename}`
    : null;

  return (
    <div className="relative h-full min-h-[200px] w-full overflow-hidden rounded-lg bg-indigo-900/30">
      {milestone.image && !hasError ? (
        <Image
          src={milestone.image}
          alt={milestone.event}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={`Fotografía no disponible: ${milestone.event}`}
          className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center text-indigo-200"
        >
          <ImageOff className="h-9 w-9 opacity-60" aria-hidden="true" />
          <span className="text-sm">Fotografía no disponible</span>
        </div>
      )}
      {sourcePage && (
        <a
          href={sourcePage}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Fuente y licencia: ${milestone.imageCredit ?? "Wikimedia Commons"}`}
          className="absolute bottom-2 right-2 max-w-[calc(100%-1rem)] rounded bg-blue-950/90 px-2 py-1 text-[10px] leading-snug text-blue-100 underline underline-offset-2 hover:bg-blue-900"
        >
          {milestone.imageCredit ?? "Wikimedia Commons · Ver fuente y licencia"}
        </a>
      )}
    </div>
  );
}
