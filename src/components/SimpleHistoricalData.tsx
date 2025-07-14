"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  yearlyAstronautCounts,
  spaceMilestones,
  getTotalPeopleEverInSpace
} from '@/services/historicalAstronautData';
import { History, Calendar, Info } from 'lucide-react';
import { SpaceMilestonesModal } from './SpaceMilestonesModal';

export function SimpleHistoricalData() {
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto mt-6 sm:mt-8 relative overflow-hidden bg-gradient-to-br from-blue-950 to-indigo-900 border-none shadow-xl card-hover">
        <div className="absolute w-full h-full top-0 left-0">
          <div className="stars"></div>
          <div className="stars2"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-300 icon-hover" />
                <span className="link-hover">Historia de Humanos en el Espacio</span>
              </h2>
              <p className="text-blue-300 text-sm mt-1">Desde Yuri Gagarin a la exploración comercial actual</p>
            </div>
            <div>
              <Button
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10 button-hover"
                onClick={() => setShowMilestonesModal(true)}
              >
                <Info className="w-4 h-4 mr-1 icon-hover" />
                <span>Hitos Espaciales</span>
              </Button>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-800/30 card-hover">
              <div className="text-xs text-blue-300 mb-1">Personas en el espacio actualmente</div>
              <div className="flex items-baseline">
                <span className="text-white text-2xl font-bold logo-hover">12</span>
                <span className="text-green-400 text-sm ml-2">Récord histórico</span>
              </div>
            </div>

            <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-800/30 card-hover">
              <div className="text-xs text-blue-300 mb-1">Personas que han viajado al espacio</div>
              <div className="flex items-baseline">
                <span className="text-white text-2xl font-bold logo-hover">{getTotalPeopleEverInSpace()}</span>
                <span className="text-blue-300 text-sm ml-2">Aproximadamente</span>
              </div>
            </div>

            <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-800/30 card-hover">
              <div className="text-xs text-blue-300 mb-1">Presencia humana continua en el espacio</div>
              <div className="flex items-baseline">
                <span className="text-white text-2xl font-bold logo-hover">23</span>
                <span className="text-blue-300 text-sm ml-2">Años (desde 2000)</span>
              </div>
            </div>
          </div>

          {/* Datos históricos simplificados */}
          <div className="bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-800/30 p-4 mb-6 card-hover">
            <h3 className="text-lg font-semibold text-white mb-3 link-hover">Evolución de Astronautas en el Espacio</h3>
            <div className="space-y-2">
              {[
                { decade: "1960s", description: "Primeros vuelos espaciales tripulados. Programas Mercury, Gemini y Apollo." },
                { decade: "1970s", description: "Misiones Apollo a la Luna. Primeras estaciones espaciales: Skylab y Salyut." },
                { decade: "1980s", description: "Inicio del programa del Transbordador Espacial. Estación Mir." },
                { decade: "1990s", description: "Misiones de larga duración en la Mir. Inicio del programa de la ISS." },
                { decade: "2000s", description: "Ocupación permanente de la ISS. Crecimiento de tripulaciones." },
                { decade: "2010s", description: "Fin de los transbordadores. Dependencia de Soyuz." },
                { decade: "2020s", description: "Vuelos espaciales comerciales. Naves Dragon y Starliner." },
              ].map((item, index) => (
                <div key={index} className="flex hover:bg-blue-800/20 rounded p-2 transition-colors">
                  <div className="flex-shrink-0 w-20">
                    <span className="text-blue-400 font-semibold icon-hover">{item.decade}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-white text-sm link-hover">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer con fuente de datos */}
          <div className="text-xs text-blue-400 text-center">
            <span>Datos proporcionados por NASA, Roscosmos, ESA y otras agencias espaciales.</span>
          </div>
        </div>
      </Card>

      {/* Modal con hitos espaciales */}
      <SpaceMilestonesModal
        isOpen={showMilestonesModal}
        onClose={() => setShowMilestonesModal(false)}
        milestones={spaceMilestones}
      />
    </>
  );
}
