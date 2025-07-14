"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SpaceData } from "@/services/spaceApi";
import { RefreshCcw, Users, Rocket, Info, Calendar, Flag } from "lucide-react";
import { UpdateCountdown } from "./UpdateCountdown";
import { MissionDetailsModal } from "./MissionDetailsModal";
import { getMissionDetails, MissionDetailedData } from "@/services/missionData";
import { AstronautImage } from "./AstronautImage"; // Importar el componente de imagen

// Intervalo de actualización automática: 5 minutos
const AUTO_UPDATE_INTERVAL = 5 * 60 * 1000;

export function SpaceCounter({
  initialData,
}: {
  initialData: SpaceData;
}) {
  const [data, setData] = useState<SpaceData>(initialData);
  const [loading, setLoading] = useState(false);
  const [animateNumber, setAnimateNumber] = useState(false);
  const [error, setError] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionDetailedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await fetch('/api/space-people');

      if (!response.ok) {
        throw new Error('Error en la respuesta del API');
      }

      const newData = await response.json();

      if (newData.message === 'error') {
        throw new Error('Error en los datos recibidos');
      }

      setData(newData);
      setAnimateNumber(true);
      setTimeout(() => setAnimateNumber(false), 1000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenModal = (astronautName: string) => {
    const missionDetails = getMissionDetails(astronautName);
    if (missionDetails) {
      setSelectedMission(missionDetails);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-950 to-indigo-900 border-none shadow-xl">
        <div className="absolute w-full h-full top-0 left-0">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-8 text-center">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              ¿Cuántas personas hay en el espacio ahora?
            </h2>
            <Button
              onClick={fetchData}
              disabled={loading}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 flex-shrink-0 ml-2"
              title="Actualizar datos"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center my-6 sm:my-8 space-y-6">
            <div className="relative flex items-center justify-center w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={data.number}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: animateNumber ? [0.8, 1.2, 1] : 1,
                      opacity: 1
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl sm:text-7xl font-bold text-white"
                  >
                    {data.number}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="text-blue-300 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-base sm:text-xl text-blue-100">Astronautas actualmente en el espacio</span>
            </div>

            {/* Contador de actualización */}
            <div className="w-full max-w-xs mt-2 sm:mt-4">
              <UpdateCountdown onComplete={fetchData} interval={AUTO_UPDATE_INTERVAL} />
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
              Misiones Activas
            </h3>

            {/* Grid responsive: 1 columna en móvil, 2 en tablet, 3 en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.people.map((person, idx) => {
                const missionDetails = getMissionDetails(person.name);
                return (
                  <div key={idx} className="group p-3 rounded-lg hover:bg-blue-900/20 transition-colors flex flex-col h-full">
                    {/* Cabecera con foto e información básica */}
                    <div className="flex items-start gap-3 mb-2">
                      {/* Reemplazar círculo con inicial por foto de astronauta */}
                      <AstronautImage
                        name={person.name}
                        className="w-12 h-12 flex-shrink-0 border-2 border-blue-500"
                      />
                      <div className="text-left">
                        <p className="text-white font-medium truncate max-w-[180px] sm:max-w-none">
                          {person.name}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-blue-300 border-blue-500 text-xs">
                            {person.craft}
                          </Badge>
                          {missionDetails && (
                            <Badge variant="outline" className="text-green-300 border-green-500 text-xs">
                              {missionDetails.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    {missionDetails && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-300 mt-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{missionDetails.mission_duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          <span>{missionDetails.nationality}</span>
                        </div>
                      </div>
                    )}

                    {/* Barra de progreso */}
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 w-full mb-2">
                        <div className="text-xs text-blue-300 whitespace-nowrap">
                          {missionDetails ? `${missionDetails.progress}%` : ''}
                        </div>
                        <Progress
                          value={missionDetails?.progress || 50}
                          className="w-full h-2 bg-blue-950 group-hover:bg-blue-900 transition-colors"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-800/50 self-end w-full"
                        onClick={() => handleOpenModal(person.name)}
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-white">
              <p>Hubo un error al actualizar los datos. Intenta de nuevo más tarde.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de detalles de misión */}
      <MissionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        missionDetails={selectedMission}
      />
    </div>
  );
}
