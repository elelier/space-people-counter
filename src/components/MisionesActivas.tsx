"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SpaceData } from "@/services/spaceApi";
import { Info, Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissionDetailsModal } from "./MissionDetailsModal";
import { getMissionDetails, MissionDetailedData } from "@/services/missionData";
import { AstronautImage } from "./AstronautImage";
import Image from "next/image";

interface MisionesActivasProps {
  astronautas: SpaceData;
}

export function MisionesActivas({ astronautas }: MisionesActivasProps) {
  const [selectedMission, setSelectedMission] = useState<MissionDetailedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Optimize by memoizing the handler creator
  const createDetailButtonHandler = useCallback((name: string) => {
    return function handleButtonClick() {
      const missionDetails = getMissionDetails(name);
      if (missionDetails) {
        setSelectedMission(missionDetails);
        setIsModalOpen(true);
      }
    };
  }, []);

  // Handle closing the mission details modal
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-950 to-indigo-900 border-none shadow-xl card-hover">
        <div className="absolute w-full h-full top-0 left-0">
          <div className="stars"></div>
          <div className="stars2"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Image
              src="/images/icons/icons8-astronaut-100.png"
              alt="Astronaut"
              width={20}
              height={20}
              className="logo-hover floating-fast"
            />
            <span className="link-hover">Misiones Activas</span>
          </h2>

          {astronautas.message === "loading" && (
            <p className="text-sm text-blue-200 mb-4" role="status">Consultando tripulación actual...</p>
          )}

          {/* Dos columnas compactas en móvil; tres en escritorio. */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {astronautas.people.map((person, idx) => {
              const missionDetails = getMissionDetails(person.name);
              // Create a handler for this specific astronaut
              const handleDetailClick = createDetailButtonHandler(person.name);

              return (
                <div key={idx} className="group p-2 sm:p-3 rounded-lg hover:bg-blue-900/20 transition-colors flex flex-col h-full card-hover min-w-0">
                  {/* Cabecera con foto e información básica */}
                  <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-2 sm:gap-3 mb-2">
                    <AstronautImage
                      name={person.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 border-2 border-blue-500 astronaut-hover rounded-full"
                    />
                    <div className="min-w-0 w-full sm:w-auto">
                      <p className="text-white text-sm sm:text-base font-medium leading-snug break-words link-hover">
                        {person.name}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap justify-center sm:justify-start">
                        <Badge variant="outline" className="text-blue-300 border-blue-500 text-xs badge-hover">
                          {person.craft}
                        </Badge>
                        {missionDetails && (
                          <Badge variant="outline" className="text-green-300 border-green-500 text-xs badge-hover">
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
                        <Calendar className="w-3 h-3 icon-hover" />
                        <span>{missionDetails.mission_duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flag className="w-3 h-3 icon-hover" />
                        <span>{missionDetails.nationality}</span>
                      </div>
                    </div>
                  )}

                  {/* No inventar progreso ni ofrecer un botón sin ficha disponible. */}
                  {missionDetails && (
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 w-full mb-2">
                        <div className="text-xs text-blue-300 whitespace-nowrap">
                          {missionDetails.progress}%
                        </div>
                        <Progress
                          value={missionDetails.progress}
                          className="w-full h-2 bg-blue-950 group-hover:bg-blue-900 transition-colors"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-800/50 self-end w-full button-hover"
                        onClick={handleDetailClick}
                      >
                        <Info className="w-3 h-3 mr-1 icon-hover" />
                        Ver detalles
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
