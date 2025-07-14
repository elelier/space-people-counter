"use client";

import { Card } from "@/components/ui/card";
import { Globe, Building, CalendarDays, Star, Settings, Shield, Zap, ChevronDown, ChevronUp, HelpCircle, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function SpaceStationsInfo() {
  // Estado para controlar las secciones expandidas en móvil
  const [expandedSection, setExpandedSection] = useState<string | null>(null); // Ninguna sección expandida por defecto
  // Estado para controlar si estamos en móvil o desktop
  const [isMobile, setIsMobile] = useState(false);
  // Estado para controlar la visualización de los datos curiosos
  const [showExtraFacts, setShowExtraFacts] = useState<{[key: string]: boolean}>({
    iss: false,
    tiangong: false,
    future: false
  });

  // Efecto para detectar el tamaño de la pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Comprobar al montar
    checkMobile();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkMobile);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Función para alternar la expansión de una sección
  const toggleSection = (section: string): void => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Función para alternar la visualización de datos curiosos
  const toggleExtraFacts = (section: string): void => {
    setShowExtraFacts((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Datos curiosos sobre las estaciones espaciales
  const issExtraFacts = [
    {
      icon: <Star className="w-4 h-4 text-blue-300" />,
      title: "Distancia recorrida",
      description: "Ha recorrido más de 4 mil millones de kilómetros, equivalente a ir y volver a Marte 20 veces"
    },
    {
      icon: <Settings className="w-4 h-4 text-blue-300" />,
      title: "Construcción",
      description: "Ensamblada en órbita a lo largo de 10 años con más de 40 misiones de construcción"
    },
    {
      icon: <Shield className="w-4 h-4 text-blue-300" />,
      title: "Protección",
      description: "Tiene escudos especiales contra micrometeoritos que pueden viajar a 27,000 km/h"
    },
    {
      icon: <Zap className="w-4 h-4 text-blue-300" />,
      title: "Energía",
      description: "Sus paneles solares generan 120 kW de electricidad, suficiente para 40 hogares promedio"
    }
  ];

  const tiangongExtraFacts = [
    {
      icon: <Star className="w-4 h-4 text-blue-300" />,
      title: "Significado",
      description: "'Tiangong' significa 'Palacio Celestial' en mandarín"
    },
    {
      icon: <Settings className="w-4 h-4 text-blue-300" />,
      title: "Diseño modular",
      description: "Compuesta por un módulo principal y dos laboratorios científicos"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 sm:mt-8">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-950 to-indigo-900 border-none shadow-xl card-hover">
        <div className="absolute w-full h-full top-0 left-0">
          <div className="stars"></div>
          <div className="stars2"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 text-center">
            ¿Quiénes están en el espacio?
          </h2>

          <p className="text-blue-100 mb-6 sm:mb-8 text-center max-w-3xl mx-auto text-sm sm:text-base">
            Este contador muestra el número actual de seres humanos que se encuentran
            fuera de la Tierra, generalmente a bordo de la Estación Espacial Internacional (ISS)
            u otras estaciones espaciales. Los datos se actualizan en tiempo real.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Sección ISS */}
            <div
              className={`bg-black/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 transition-all duration-300 hover:bg-black/30 ${
                expandedSection === 'iss' ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              <div
                className="flex items-center gap-3 mb-3 sm:mb-4 cursor-pointer"
                onClick={() => {
                  toggleSection('iss');
                }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-blue-800/50 flex-shrink-0 hover:bg-blue-800/70 transition-all duration-300">
                  <Image
                    src="/images/icons/icons8-space-shuttle-100.png"
                    alt="Space Shuttle"
                    width={24}
                    height={24}
                    className="logo-hover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white link-hover">Estación Espacial Internacional</h3>
                  <p className="text-blue-300 text-xs sm:text-sm">
                    {expandedSection === 'iss' ? 'Toca para ocultar' : 'Toca para más información'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {expandedSection === 'iss' ? (
                    <ChevronUp className="w-5 h-5 text-blue-300 icon-hover" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-300 icon-hover" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {(expandedSection === 'iss' || !isMobile) && (
                  <motion.div
                    className="space-y-3 sm:space-y-4 text-blue-100"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm sm:text-base">
                      La ISS es un laboratorio en órbita que ha estado continuamente habitado
                      desde el año 2000, y generalmente alberga entre 3 y 10 astronautas.
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-300 flex-shrink-0" />
                        <span>Órbita a 408 km de altura</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-300 flex-shrink-0" />
                        <span>Lanzada en 1998</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-300 flex-shrink-0" />
                        <span>Tamaño: 109 x 73 metros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/images/icons/icons8-space-shuttle-100.png"
                          alt="Space Shuttle"
                          width={16}
                          height={16}
                          className="flex-shrink-0"
                        />
                        <span>Velocidad: 27,600 km/h</span>
                      </div>
                    </div>

                    {/* Botón para mostrar/ocultar datos curiosos */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleExtraFacts('iss');
                      }}
                      className="w-full mt-2 flex items-center justify-between border-blue-700/50 hover:bg-blue-800/30 button-hover"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-300" />
                        <span className="text-sm">¿Sabías que...?</span>
                      </div>
                      {showExtraFacts.iss ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {/* Datos curiosos adicionales - colapsables */}
                    <AnimatePresence>
                      {showExtraFacts.iss && (
                        <motion.div
                          className="mt-2 border-t border-blue-800/40 pt-4"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {issExtraFacts.map((fact, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-blue-800/10 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-blue-800/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {fact.icon}
                                </div>
                                <div>
                                  <h5 className="text-white text-xs font-medium">{fact.title}</h5>
                                  <p className="text-blue-200 text-xs">{fact.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sección Otras Estaciones */}
            <div
              className={`bg-black/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 transition-all duration-300 hover:bg-black/30 ${
                expandedSection === 'other' ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              <div
                className="flex items-center gap-3 mb-3 sm:mb-4 cursor-pointer"
                onClick={() => {
                  toggleSection('other');
                }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-blue-800/50 flex-shrink-0 hover:bg-blue-800/70 transition-all duration-300">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 icon-hover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white link-hover">Otras estaciones espaciales</h3>
                  <p className="text-blue-300 text-xs sm:text-sm">
                    {expandedSection === 'other' ? 'Toca para ocultar' : 'Toca para más información'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {expandedSection === 'other' ? (
                    <ChevronUp className="w-5 h-5 text-blue-300 icon-hover" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-300 icon-hover" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {(expandedSection === 'other' || !isMobile) && (
                  <motion.div
                    className="space-y-3 sm:space-y-4 text-blue-100"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm sm:text-base">
                      China tiene su propia estación espacial, Tiangong, y hay planes para
                      estaciones espaciales comerciales en el futuro cercano.
                    </p>

                    <div className="border-t border-blue-800/50 pt-3 sm:pt-4 mt-3 sm:mt-4">
                      <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Tiangong (Estación Espacial China)</h4>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-blue-300 flex-shrink-0" />
                          <span>Completada en 2022</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-300 flex-shrink-0" />
                          <span>Órbita a 390 km de altura</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-300 flex-shrink-0" />
                          <span>Tripulación habitual: 3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src="/images/icons/icons8-space-shuttle-100.png"
                            alt="Space Shuttle"
                            width={16}
                            height={16}
                            className="flex-shrink-0"
                          />
                          <span>Vida útil: 10-15 años</span>
                        </div>
                      </div>

                      {/* Botón para mostrar/ocultar datos curiosos de Tiangong */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toggleExtraFacts('tiangong');
                        }}
                        className="w-full mt-3 flex items-center justify-between border-blue-700/50 hover:bg-blue-800/30 button-hover"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-300" />
                          <span className="text-sm">¿Sabías que...?</span>
                        </div>
                        {showExtraFacts.tiangong ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>

                      {/* Datos curiosos de Tiangong - colapsables */}
                      <AnimatePresence>
                        {showExtraFacts.tiangong && (
                          <motion.div
                            className="mt-3 space-y-2 bg-blue-800/10 rounded-lg p-3"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h5 className="text-white text-xs font-medium mb-2">Datos curiosos:</h5>
                            {tiangongExtraFacts.map((fact, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-800/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {fact.icon}
                                </div>
                                <div>
                                  <span className="text-white text-xs font-medium">{fact.title}:</span>
                                  <p className="text-blue-200 text-xs">{fact.description}</p>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="border-t border-blue-800/50 pt-3 sm:pt-4 mt-3 sm:mt-4">
                      <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Estaciones Futuras</h4>
                      <p className="text-xs sm:text-sm">
                        Empresas como Axiom Space y Blue Origin están desarrollando estaciones
                        espaciales comerciales que podrían reemplazar a la ISS cuando esta sea
                        retirada a finales de la década de 2020.
                      </p>

                      {/* Botón para mostrar/ocultar datos curiosos de estaciones futuras */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toggleExtraFacts('future');
                        }}
                        className="w-full mt-3 flex items-center justify-between border-blue-700/50 hover:bg-blue-800/30 button-hover"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-300" />
                          <span className="text-sm">¿Qué se espera en el futuro?</span>
                        </div>
                        {showExtraFacts.future ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>

                      {/* Datos curiosos de estaciones futuras - colapsables */}
                      <AnimatePresence>
                        {showExtraFacts.future && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-xs mt-3 text-blue-300 bg-blue-800/10 rounded-lg p-3">
                              Se espera que las futuras estaciones espaciales comerciales
                              tengan habitaciones para turistas espaciales y laboratorios privados
                              para investigación y fabricación en microgravedad.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-blue-800/30 text-center text-blue-300 text-xs sm:text-sm">
            <p>Datos proporcionados por Open Notify API - En tiempo real</p>
            <p className="mt-1">&copy; 2025 Space People Counter</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
