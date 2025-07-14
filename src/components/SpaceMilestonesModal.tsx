"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HistoricalMilestone } from "@/services/historicalAstronautData";

interface SpaceMilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: HistoricalMilestone[];
}

export function SpaceMilestonesModal({ isOpen, onClose, milestones }: SpaceMilestonesModalProps) {
  const [animate, setAnimate] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);

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

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Gestionar el cierre con animación
  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 300);
  };

  // Navegar entre hitos
  const navigateMilestone = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setSelectedMilestone(prev => (prev === milestones.length - 1) ? 0 : prev + 1);
    } else {
      setSelectedMilestone(prev => (prev === 0) ? milestones.length - 1 : prev - 1);
    }
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
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-300 icon-hover" />
              <span className="link-hover">Hitos Importantes en la Exploración Espacial</span>
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors button-hover"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 icon-hover" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-150px)]">
          {/* Navegación */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs text-blue-300">
              Hito {selectedMilestone + 1} de {milestones.length}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMilestone('prev')}
                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-indigo-800/30 button-hover"
              >
                <ChevronLeft className="h-5 w-5 icon-hover" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMilestone('next')}
                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-indigo-800/30 button-hover"
              >
                <ChevronRight className="h-5 w-5 icon-hover" />
              </Button>
            </div>
          </div>

          {/* Detalle del hito seleccionado */}
          <div className="flex flex-col md:flex-row gap-4 bg-indigo-950/40 rounded-lg p-4 mb-4 card-hover">
            <div className="md:w-2/5">
              <div className="rounded-lg overflow-hidden h-[200px] md:h-[250px] bg-indigo-900/30 relative">
                {milestones[selectedMilestone].image && (
                  <Image
                    src={milestones[selectedMilestone].image || ''}
                    alt={milestones[selectedMilestone].event}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover logo-hover"
                  />
                )}
              </div>
            </div>
            <div className="md:w-3/5">
              <div className="text-xs text-indigo-300 mb-1">
                {new Date(milestones[selectedMilestone].date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <h4 className="text-xl font-semibold text-white mb-2 link-hover">
                {milestones[selectedMilestone].event}
              </h4>
              <p className="text-gray-300 text-sm mt-2 mb-3">
                {milestones[selectedMilestone].description}
              </p>
              {milestones[selectedMilestone].astronauts && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-indigo-300 mb-1">Astronautas:</h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {milestones[selectedMilestone].astronauts!.map((astronaut, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-indigo-900/50 text-white px-2 py-1 rounded badge-hover"
                      >
                        {astronaut}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cronología de hitos */}
          <div className="mt-4">
            <h3 className="text-md font-semibold text-white mb-3 link-hover">Cronología de la Exploración Espacial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded cursor-pointer transition-colors
                    ${selectedMilestone === index
                      ? 'bg-indigo-700/60 border-indigo-500'
                      : 'bg-indigo-900/30 hover:bg-indigo-800/40 border-transparent'}
                    border card-hover
                  `}
                  onClick={() => setSelectedMilestone(index)}
                >
                  <div className="text-xs font-medium text-indigo-300">
                    {milestone.date.split('-')[0]}
                  </div>
                  <div className="text-sm text-white truncate link-hover">
                    {milestone.event}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="p-3 md:p-4 bg-blue-950/80 border-t border-blue-700 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Info className="w-3 h-3 icon-hover" />
            <span>Datos históricos compilados de NASA, Roscosmos, ESA y CNSA.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
