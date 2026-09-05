"use client";

import { useState } from "react";
import { RefreshCcw, Share2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpaceData } from "@/services/spaceApi";

interface PersonasEnEspacioProps {
  data: SpaceData | null;
  loading: boolean;
  onRefresh: () => void;
}

type WindowWithGtag = Window & {
  gtag?: (...args: unknown[]) => void;
};

const SHARE_URL = "https://spacepeople.elelier.com/";

const SOURCE_LABELS: Record<string, string> = {
  "launch-library-2": "Launch Library 2",
  "open-notify": "Open Notify",
  "last-known-good-cache": "último dato verificado",
  "static-fallback": "dato de respaldo",
  "client-static-fallback": "dato de respaldo",
};

export function PersonasEnEspacio({ data, loading, onRefresh }: PersonasEnEspacioProps) {
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const count = data?.number;
  const isFallback = data?.isFallback === true || data?.status === "fallback";
  const sourceLabel = data?.source ? SOURCE_LABELS[data.source] ?? data.source : null;
  const freshnessTimestamp = isFallback
    ? data?.lastSuccessfulUpdate
    : data?.lastSuccessfulUpdate ?? data?.timestamp;

  let freshnessLabel: string | null = null;
  if (freshnessTimestamp) {
    const parsed = new Date(freshnessTimestamp);
    if (!Number.isNaN(parsed.getTime())) {
      freshnessLabel = parsed.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }

  const handleShare = async () => {
    if (count === undefined || typeof window === "undefined") return;

    const shareData = {
      title: "Space People",
      text: `Ahora mismo hay ${count} personas en el espacio 🚀`,
      url: SHARE_URL,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        (window as WindowWithGtag).gtag?.("event", "share_space_count", {
          method: "native_share",
          space_people_count: count,
        });
        setShareStatus("Dato compartido");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(SHARE_URL);
      (window as WindowWithGtag).gtag?.("event", "share_space_count", {
        method: "clipboard",
        space_people_count: count,
      });
      setShareStatus("Enlace copiado");
    } catch {
      setShareStatus("Copia la URL desde tu navegador para compartirla");
    }
  };

  const handleViewPeople = () => {
    if (typeof window !== "undefined") {
      (window as WindowWithGtag).gtag?.("event", "view_space_people");
    }
    document.getElementById("misiones")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="w-full max-w-5xl mx-auto" aria-labelledby="space-count-title">
      <Card className="relative overflow-hidden border border-blue-800/70 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 shadow-2xl">
        <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden="true">
          <div className="stars" />
          <div className="stars2" />
        </div>

        <div className="relative z-10 px-5 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16 text-center">
          <div className="flex justify-end mb-2">
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="ghost"
              size="icon"
              className="text-blue-200 hover:text-white hover:bg-blue-900/50"
              aria-label="Actualizar datos ahora"
              title="Actualizar datos ahora"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <h1
            id="space-count-title"
            className="mx-auto max-w-3xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
          >
            ¿Cuántas personas hay en el espacio ahora?
          </h1>

          <div className="mt-8 flex justify-center">
            <div className="min-w-40 rounded-3xl border border-blue-400/30 bg-blue-500/10 px-8 py-6 shadow-[0_0_70px_rgba(59,130,246,0.18)]">
              <div className="text-7xl sm:text-8xl font-bold tabular-nums text-white" aria-live="polite">
                {count ?? (loading ? "…" : "—")}
              </div>
            </div>
          </div>

          <p className="mt-6 text-lg sm:text-xl text-blue-100">
            {count !== undefined
              ? `Hay ${count} personas actualmente en órbita.`
              : "Consultando fuentes públicas de datos espaciales…"}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-blue-200">
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isFallback ? "bg-amber-400" : "bg-emerald-400"}`}
                aria-hidden="true"
              />
              {data ? (isFallback ? "Dato de respaldo" : "Datos en vivo") : "Conectando…"}
            </span>
            {sourceLabel && <span>Fuente: {sourceLabel}</span>}
            {freshnessLabel && <span>Actualizado: {freshnessLabel}</span>}
          </div>

          {isFallback && (
            <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100" role="status">
              No pudimos actualizar los datos en vivo. Mostramos el último dato de respaldo disponible.
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => void handleShare()}
              disabled={count === undefined}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white px-6 py-5"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir este dato
            </Button>
            <Button
              onClick={handleViewPeople}
              variant="outline"
              className="w-full sm:w-auto border-blue-400/40 bg-transparent text-blue-100 hover:bg-blue-900/40 hover:text-white px-6 py-5"
            >
              <Users className="mr-2 h-4 w-4" />
              Ver quiénes están arriba
            </Button>
          </div>

          {shareStatus && (
            <p className="mt-3 text-sm text-blue-200" role="status" aria-live="polite">
              {shareStatus}
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
