"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { getISSLocation, ISSLocationData } from "@/services/issLocationApi";
import { formatOrbitalSpeed } from "@/lib/issOrbitalSpeed";
import { Button } from "@/components/ui/button";
import { RefreshCcw, MapPin, AlertCircle, Satellite, Globe, ChevronDown, ChevronUp, Info, Clock, FlaskConical, Users, PlusCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Importación dinámica para evitar errores de SSR con leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] sm:h-[400px] bg-blue-900/50 flex items-center justify-center text-white overflow-hidden">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-4">
          {/* Círculo exterior */}
          <div className="absolute inset-0 border-4 border-blue-400 opacity-40 rounded-full animate-pulse"></div>
          {/* Círculo central */}
          <div className="absolute inset-4 border-4 border-blue-300 opacity-60 rounded-full"></div>
          {/* Círculo giratorio */}
          <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
          {/* Punto central */}
          <div className="absolute inset-7 bg-blue-600 rounded-full"></div>
        </div>
        <p className="text-lg font-medium">Cargando mapa de la ISS</p>
        <p className="text-sm text-blue-300 mt-1">Por favor espere...</p>
      </div>
    </div>
  ),
});

// Datos curiosos sobre la ISS
const issFacts = [
  {
    icon: <Clock className="w-4 h-4 text-blue-300" />,
    title: "Órbita",
    description: "Da la vuelta a la Tierra cada 90 minutos (16 órbitas al día)"
  },
  {
    icon: <FlaskConical className="w-4 h-4 text-blue-300" />,
    title: "Laboratorio",
    description: "Más de 3,000 experimentos científicos realizados a bordo"
  },
  {
    icon: <Users className="w-4 h-4 text-blue-300" />,
    title: "Habitada",
    description: "Continuamente habitada desde noviembre del 2000"
  },
  {
    icon: <Satellite className="w-4 h-4 text-blue-300" />,
    title: "Tamaño",
    description: "Tan grande como un campo de fútbol (109 x 73 metros)"
  }
];

// Valor inicial por defecto para la ubicación de la ISS
const defaultISSLocation: ISSLocationData = {
  message: "success",
  timestamp: Math.floor(Date.now() / 1000),
  status: "fallback",
  source: "client-default",
  isFallback: true,
  lastSuccessfulUpdate: null,
  responseTime: 0,
  error: null,
  iss_position: {
    latitude: "0",
    longitude: "0"
  }
};

interface ISSMapProps {
  initialLocation?: ISSLocationData;
}

export function ISSMap({ initialLocation = defaultISSLocation }: ISSMapProps) {
  const [issLocation, setIssLocation] = useState<ISSLocationData>(initialLocation);
  // Instrumentación efímera para QA visual: solo en un Preview de este proyecto.
  const [previewQaEnabled, setPreviewQaEnabled] = useState(false);
  const [qaVisibility, setQaVisibility] = useState<"daylight" | "eclipsed" | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mapError, setMapError] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);
  // Datos curiosos colapsados por defecto
  const [showFacts, setShowFacts] = useState(false);
  // Estado para rastrear el tiempo desde la última actualización
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  // Estado para el modo de actualización automática
  const [autoUpdateActive, setAutoUpdateActive] = useState<boolean>(true);
  const [followISS, setFollowISS] = useState<boolean>(true);
  // Estado para mostrar detalles técnicos adicionales
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  useEffect(() => {
    setPreviewQaEnabled(
      window.location.hostname.endsWith(".space-people-counter.pages.dev") &&
      new URLSearchParams(window.location.search).get("qaTheme") === "1"
    );
  }, []);

  const usingFallback = issLocation.isFallback === true || issLocation.message.includes("simulated");

  // Usando useCallback para evitar recreación de la función en cada render
  const fetchISSLocation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getISSLocation();
      setIssLocation(data);
      setLastUpdateTime(Date.now());

      // Actualizar timestamp en el cliente para evitar problemas de hidratación
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setLastUpdated(hours + ":" + minutes + ":" + seconds);

      if (mapError) setMapError(false);
    } catch (error) {
      console.error("Error fetching ISS location:", error);
      setMapError(true);
    } finally {
      setLoading(false);
    }
  }, [mapError]);

  // Consulta inicial y cada 5 segundos solo mientras la actualización esté activa.
  // Al pausar no se dispara una consulta adicional ni se altera la hora mostrada.
  useEffect(() => {
    if (!autoUpdateActive) return;

    fetchISSLocation();
    const interval = setInterval(fetchISSLocation, 5000);
    return () => clearInterval(interval);
  }, [fetchISSLocation, autoUpdateActive]);

  // Verificar que iss_position existe antes de intentar acceder a sus propiedades
  const latitude = issLocation?.iss_position?.latitude
    ? parseFloat(issLocation.iss_position.latitude)
    : 0;

  const longitude = issLocation?.iss_position?.longitude
    ? parseFloat(issLocation.iss_position.longitude)
    : 0;

  // Presentar una única medición orbital validada en panel y popup.
  const orbitalSpeedDisplay = formatOrbitalSpeed(issLocation);
  const altitudeKm = issLocation?.altitude || 408;
  const visibility = previewQaEnabled && qaVisibility
    ? qaVisibility
    : issLocation?.visibility || "unknown";
  const footprint = issLocation?.footprint;

  // Calcular si está en el día o en la noche según el valor de visibilidad de la API
  const isDay = visibility === "daylight";

  // Renderizar el tiempo desde la última actualización
  const renderTimeSinceUpdate = () => {
    const secondsSinceUpdate = Math.floor((Date.now() - lastUpdateTime) / 1000);

    if (secondsSinceUpdate < 60) {
      return `${secondsSinceUpdate}s ago`;
    } else if (secondsSinceUpdate < 3600) {
      return `${Math.floor(secondsSinceUpdate / 60)}m ago`;
    } else {
      return `${Math.floor(secondsSinceUpdate / 3600)}h ago`;
    }
  };

  // Alternar la visualización de información adicional en dispositivos móviles
  const toggleInfo = () => {
    setExpandedInfo(!expandedInfo);
  };

  // Alternar la visualización de datos curiosos
  const toggleFacts = () => {
    setShowFacts(!showFacts);
  };

  // La exploración manual detiene el centrado, no la actualización de datos.
  const handleExplore = useCallback(() => setFollowISS(false), []);

  const resumeFollowing = () => setFollowISS(true);

  // Alternar actualización automática sin cambiar el modo de seguimiento.
  const toggleAutoUpdate = () => {
    setAutoUpdateActive(!autoUpdateActive);
  };

  // Alternar detalles técnicos
  const toggleTechnicalDetails = () => {
    setShowTechnicalDetails(!showTechnicalDetails);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6" id="mapa-iss">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-950 to-indigo-900 border-none shadow-xl card-hover">
        <div className="absolute w-full h-full top-0 left-0">
          <div className="stars"></div>
          <div className="stars2"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Satellite className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 icon-hover" />
              <span className="link-hover">Ubicación de la ISS</span>
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 border-blue-700 text-blue-300 hover:bg-blue-900/30 button-hover"
                onClick={toggleAutoUpdate}
              >
                <Clock className="w-3 h-3 mr-1 icon-hover" />
                <span>{autoUpdateActive ? "Pausar datos" : "Reanudar datos"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 border-blue-700 text-blue-300 hover:bg-blue-900/30 button-hover"
                onClick={fetchISSLocation}
                disabled={loading}
              >
                <RefreshCcw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : "icon-hover"}`} />
                <span>Actualizar</span>
              </Button>
              <div className="hidden md:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-blue-700 text-blue-300 hover:bg-blue-900/30 button-hover"
                  onClick={toggleTechnicalDetails}
                >
                  <Info className="w-3 h-3 mr-1 icon-hover" />
                  <span>
                    {showTechnicalDetails ? "Ocultar detalles" : "Ver detalles"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {previewQaEnabled && (
            <div data-testid="qa-iss-visibility" className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-950/30 p-2 text-xs text-yellow-100">
              <span>QA Preview · iluminación simulada:</span>
              <Button size="sm" variant="outline" onClick={() => setQaVisibility("daylight")}>Día</Button>
              <Button size="sm" variant="outline" onClick={() => setQaVisibility("eclipsed")}>Noche</Button>
              <Button size="sm" variant="outline" onClick={() => setQaVisibility(null)}>Real</Button>
            </div>
          )}

          {/* Información de coordenadas en versión móvil (antes del mapa) */}
          <div className={`md:hidden grid grid-cols-2 gap-2 mb-4 ${expandedInfo ? "block" : "hidden"}`}>
            <div className="bg-blue-900/30 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-blue-300 text-xs mb-1">Latitud</div>
              <div className="text-white font-bold text-sm">{latitude.toFixed(4)}°</div>
            </div>

            <div className="bg-blue-900/30 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-blue-300 text-xs mb-1">Longitud</div>
              <div className="text-white font-bold text-sm">{longitude.toFixed(4)}°</div>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden mb-4 sm:mb-6 shadow-xl border border-blue-800/30">
            {mapError ? (
              <div className="w-full h-[300px] sm:h-[400px] bg-blue-900/50 flex items-center justify-center text-white">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-lg font-medium mb-3">No se pudo cargar el mapa</p>
                  <Button
                    variant="outline"
                    onClick={fetchISSLocation}
                    className="border-blue-500 text-blue-300 hover:bg-blue-800/30"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : (
              <MapComponent
                latitude={latitude}
                longitude={longitude}
                showGrid={showGrid}
                altitude={altitudeKm}
                orbitalSpeedDisplay={orbitalSpeedDisplay}
                visibility={visibility}
                followISS={followISS}
                onExplore={handleExplore}
              />
            )}
          </div>

          {/* El estado de seguimiento siempre es visible, también en móvil. */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-900/20 px-3 py-2 text-xs text-blue-100">
            <span role="status" aria-live="polite">
              {followISS ? "Siguiendo ISS" : "Explorando mapa"} · {autoUpdateActive ? "actualización automática activa" : "datos pausados"}
            </span>
            {!followISS && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-blue-700 text-blue-200 hover:bg-blue-900/40"
                onClick={resumeFollowing}
              >
                <MapPin className="mr-1 h-3 w-3" />
                Seguir ISS
              </Button>
            )}
          </div>

          {/* Ocultar en móvil si no está expandido */}
          <div className={`${expandedInfo ? "block" : "hidden"} md:block`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4">
              <div className="bg-blue-900/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-blue-300 text-xs mb-1">Latitud</div>
                <div className="text-white font-bold text-sm sm:text-lg">{latitude.toFixed(4)}°</div>
              </div>

              <div className="bg-blue-900/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-blue-300 text-xs mb-1">Longitud</div>
                <div className="text-white font-bold text-sm sm:text-lg">{longitude.toFixed(4)}°</div>
              </div>

              <div className="bg-blue-900/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-blue-300 text-xs mb-1">Velocidad orbital</div>
                <div className="text-white font-bold text-sm sm:text-lg">{orbitalSpeedDisplay}</div>
              </div>

              <div className="bg-blue-900/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-blue-300 text-xs mb-1">Altitud</div>
                <div className="text-white font-bold text-sm sm:text-lg">{Math.round(altitudeKm)} km</div>
              </div>
            </div>

            <div className="bg-blue-900/30 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center backdrop-blur-sm gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 flex-shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium">Estado:</span>
                  <span className="text-blue-100 ml-2 text-sm">
                    {visibility === "daylight" ? "Zona de día" :
                     visibility === "eclipsed" ? "Zona de noche" :
                     "Desconocido"} • Órbita terrestre baja
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-blue-300 text-xs">Última actualización</div>
                  <div className="text-white text-sm font-medium" suppressHydrationWarning>
                    {lastUpdated || "Actualizando..."}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-300 text-xs">Hace</div>
                  <div className="text-white text-sm font-medium">
                    {renderTimeSinceUpdate()}
                  </div>
                </div>
              </div>
            </div>

            {/* Datos técnicos adicionales */}
            <div className="mb-4">
              <Button
                onClick={toggleTechnicalDetails}
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-between border-blue-800 text-blue-300 hover:text-white hover:bg-blue-800/30"
              >
                <span className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  <span>Datos técnicos adicionales</span>
                </span>
                {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              <AnimatePresence>
                {showTechnicalDetails && (
                  <motion.div
                    className="bg-blue-800/20 rounded-lg border border-blue-800/30 mt-2 p-4"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-blue-300 font-medium text-sm mb-2">Datos orbitales</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center justify-between">
                            <span className="text-gray-300">Huella terrestre:</span>
                            <span className="text-white font-medium">{footprint ? Math.round(footprint) : "~4500"} km</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-gray-300">Período orbital:</span>
                            <span className="text-white font-medium">~92 minutos</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-gray-300">Inclinación:</span>
                            <span className="text-white font-medium">51.6°</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-blue-300 font-medium text-sm mb-2">Estado de los datos</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center justify-between">
                            <span className="text-gray-300">Fuente de datos:</span>
                            <span className="text-white font-medium">{usingFallback ? "Simulación" : "API en vivo"}</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-gray-300">ID de seguimiento:</span>
                            <span className="text-white font-medium">NORAD 25544</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-gray-300">Precisión:</span>
                            <span className="text-white font-medium">{usingFallback ? "Baja" : "Alta"}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sección de datos curiosos con diseño destacado pero colapsada por defecto */}
          <div className="mt-4">
            <Button
              onClick={toggleFacts}
              variant="outline"
              className="w-full flex items-center justify-between bg-blue-900/20 border-blue-700/50 hover:bg-blue-900/30 button-hover"
            >
              <div className="flex items-center">
                <FlaskConical className="w-4 h-4 mr-2 text-blue-300 icon-hover" />
                <span>Datos interesantes sobre la ISS</span>
              </div>
              {showFacts ? (
                <ChevronUp className="w-4 h-4 text-blue-300 icon-hover" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-300 icon-hover" />
              )}
            </Button>

            <AnimatePresence>
              {showFacts && (
                <motion.div
                  className="bg-blue-900/30 rounded-lg overflow-hidden backdrop-blur-sm border border-blue-700/50"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {issFacts.map((fact, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-800/20 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-800/50 flex items-center justify-center flex-shrink-0">
                            {fact.icon}
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">{fact.title}</h4>
                            <p className="text-blue-200 text-xs sm:text-sm">{fact.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  );
}
