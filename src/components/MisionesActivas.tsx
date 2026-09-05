"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpaceData } from "@/services/spaceApi";
import { Orbit, UserRound } from "lucide-react";

interface MisionesActivasProps {
  astronautas: SpaceData | null;
  loading?: boolean;
}

export function MisionesActivas({ astronautas, loading = false }: MisionesActivasProps) {
  const peopleByCraft = (astronautas?.people ?? []).reduce<Record<string, string[]>>((groups, person) => {
    const craft = person.craft || "Misión orbital";
    groups[craft] = [...(groups[craft] ?? []), person.name];
    return groups;
  }, {});

  const craftGroups = Object.entries(peopleByCraft).sort(([a], [b]) => a.localeCompare(b));

  return (
    <section className="w-full max-w-5xl mx-auto" aria-labelledby="people-in-space-title">
      <div className="mb-5 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">Tripulación actual</p>
        <h2 id="people-in-space-title" className="mt-2 text-2xl sm:text-3xl font-bold text-white">
          Quiénes están arriba
        </h2>
        <p className="mt-2 text-slate-300">
          El listado usa exactamente los mismos datos que el contador de arriba.
        </p>
      </div>

      {loading && !astronautas ? (
        <Card className="border-blue-900/60 bg-blue-950/50 p-6 text-blue-200">
          Consultando la tripulación actual…
        </Card>
      ) : craftGroups.length === 0 ? (
        <Card className="border-blue-900/60 bg-blue-950/50 p-6 text-blue-200">
          No hay un listado de tripulación disponible en este momento.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {craftGroups.map(([craft, names]) => (
            <Card key={craft} className="border-blue-900/70 bg-slate-950/70 p-5 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between gap-3 border-b border-blue-900/50 pb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Orbit className="h-5 w-5 shrink-0 text-blue-400" aria-hidden="true" />
                  <h3 className="truncate text-lg font-semibold text-white">{craft}</h3>
                </div>
                <Badge variant="outline" className="border-blue-500/50 text-blue-200">
                  {names.length} {names.length === 1 ? "persona" : "personas"}
                </Badge>
              </div>

              <ul className="mt-4 space-y-3">
                {names.map((name) => (
                  <li key={`${craft}-${name}`} className="flex items-center gap-3 text-slate-100">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
