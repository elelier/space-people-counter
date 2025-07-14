"use client";

import { useState, useEffect } from "react";
import { X, CalendarDays, Flag, Award, Target, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MissionDetailedData } from "@/services/missionData";

interface MissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionDetails: MissionDetailedData | null;
}

export function MissionDetailsModal({ isOpen, onClose, missionDetails }: MissionDetailsModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      // Prevenir el desplazamiento de la página cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      setAnimate(false);
      // Restaurar el desplazamiento cuando se cierra
      document.body.style.overflow = '';
    }

    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !missionDetails) return null;

  // Solución muy simple para formatear fechas sin usar toLocaleDateString
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return dateString;
    }
  };

  const missionStartDate = formatDate(missionDetails.mission_start);
  const missionEndDate = missionDetails.mission_end ? formatDate(missionDetails.mission_end) : 'En curso';

  // Gestionar el cierre con animación
  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-2 md:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-3xl bg-gradient-to-br from-blue-950 to-indigo-900 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform my-4 md:my-0 ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()} // Evitar que se cierre al hacer clic en el contenido
      >
        {/* Cabecera con fondo de estrellas */}
        <div className="relative p-4 md:p-6 border-b border-blue-700">
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="stars"></div>
            <div className="stars2"></div>
          </div>

          <div className="relative flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Detalles de Misión</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-150px)]">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Información del astronauta */}
            <div className="md:w-1/3 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold flex-shrink-0">
                  {missionDetails.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">{missionDetails.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant="outline" className="text-blue-300 border-blue-500 text-xs">
                      {missionDetails.craft}
                    </Badge>
                    <Badge variant="outline" className="text-green-300 border-green-500 text-xs">
                      {missionDetails.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-blue-900/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-blue-300 flex-shrink-0" />
                  <span className="text-blue-100 text-sm">{missionDetails.nationality}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-300 flex-shrink-0" />
                  <span className="text-blue-100 text-sm">Inicio: {missionStartDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-300 flex-shrink-0" />
                  <span className="text-blue-100 text-sm">Duración: {missionDetails.mission_duration}</span>
                </div>
              </div>

              {/* Agencia espacial */}
              {missionDetails.agency && (
                <div className="bg-blue-900/30 rounded-lg p-3 md:p-4">
                  <h4 className="text-white font-medium text-sm mb-2">Agencia Espacial</h4>
                  <div className="flex items-center gap-3">
                    {missionDetails.agency_logo && (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-md p-1 flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-white/20 rounded"></div>
                      </div>
                    )}
                    <span className="text-blue-100 text-sm">{missionDetails.agency}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Detalles de la misión */}
            <div className="md:w-2/3 space-y-4 mt-4 md:mt-0">
              <div className="bg-blue-900/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 md:w-5 md:h-5 text-blue-300" />
                  <h3 className="text-lg md:text-xl font-bold text-white">{missionDetails.mission_name}</h3>
                </div>

                <p className="text-blue-100 text-sm mb-4">{missionDetails.mission_description}</p>

                <div className="w-full bg-blue-950 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full"
                    style={{ width: `${missionDetails.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-blue-300 mt-1">
                  <span>Progreso</span>
                  <span>{missionDetails.progress}%</span>
                </div>
              </div>

              {/* Objetivos de la misión */}
              <div className="bg-blue-900/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-blue-300" />
                  <h4 className="text-white font-medium">Objetivos de la Misión</h4>
                </div>

                <ul className="space-y-2">
                  {missionDetails.mission_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-blue-100 text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="p-3 md:p-4 bg-blue-950/80 border-t border-blue-700 text-center">
          <p className="text-blue-300 text-xs md:text-sm">
            Datos actualizados en tiempo real • © 2025 Space People Counter
          </p>
        </div>
      </div>
    </div>
  );
}
