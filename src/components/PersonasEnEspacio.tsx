"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPeopleInSpace, SpaceData } from "@/services/spaceApi";
import { getRosterDelta } from "@/services/counterDelta";
import { RefreshCcw, Users } from "lucide-react";
import { UpdateCountdown } from "./UpdateCountdown";
import { Alert, AlertType } from "@/components/ui/alert";

// Intervalo de actualización automática: 5 minutos
const AUTO_UPDATE_INTERVAL = 5 * 60 * 1000;

interface PersonasEnEspacioProps {
  initialData: SpaceData;
  onDataChange?: (updated: SpaceData) => void;
}

interface AlertInfo {
  type: AlertType;
  title: string;
  message: string;
}

// Interfaz para definir la estructura de los datos de astronautas
interface AstronautData {
  name: string;
  craft: string;
}

export function PersonasEnEspacio({ initialData, onDataChange }: PersonasEnEspacioProps) {
  const [data, setData] = useState<SpaceData>(initialData);
  const [loading, setLoading] = useState(true);
  const [animateNumber, setAnimateNumber] = useState(false);
  const [error, setError] = useState(false);

  // Estado para el componente Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    type: "info",
    title: "",
    message: ""
  });

  // Solo comparamos contra una respuesta recibida en esta sesión, nunca el 0 inicial.
  const latestDataRef = useRef<SpaceData | null>(null);
  const requestInFlightRef = useRef(false);

  // Función para mostrar una alerta
  const showNotification = (type: AlertType, title: string, message: string): void => {
    setAlertInfo({ type, title, message });
    setShowAlert(true);
  };

  // Función para obtener datos actualizados
  const fetchData = useCallback(async (): Promise<void> => {
    if (requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setLoading(true);

    try {
      const newData: SpaceData = await getPeopleInSpace();
      const usingFallback = newData.isFallback === true || newData.message.toLowerCase().includes("fallback");
      setError(usingFallback);
      const previous = latestDataRef.current;
      const delta = getRosterDelta(previous, newData);

      // Solo comparar dos lecturas reales consecutivas; nunca contra el placeholder.
      if (previous && delta !== null) {
        // Identificar astronautas que han llegado o partido desde la última actualización
        const newAstronauts = newData.people.filter(
          (astronaut: AstronautData) =>
            !previous.people.some((a: AstronautData) => a.name === astronaut.name)
        );

        const departedAstronauts = previous.people.filter(
          (astronaut: AstronautData) =>
            !newData.people.some((a: AstronautData) => a.name === astronaut.name)
        ).map((a: AstronautData) => a.name);

        // Notificar dependiendo del cambio
        if (delta > 0) {
          const newAstronautNames = newAstronauts.map((a: AstronautData) => a.name);
          const message = newAstronautNames.length > 0
            ? `Nuevos astronautas: ${newAstronautNames.join(", ")}`
            : "Nuevos astronautas han llegado al espacio";

          showNotification(
            "success",
            `¡El número de astronautas ha aumentado a ${newData.number}!`,
            message
          );
        } else if (delta < 0) {
          const message = departedAstronauts.length > 0
            ? `Astronautas que han regresado: ${departedAstronauts.join(", ")}`
            : "Algunos astronautas han regresado a la Tierra";

          showNotification(
            "warning",
            `El número de astronautas ha disminuido a ${newData.number}`,
            message
          );
        }
      }

      latestDataRef.current = newData;
      setData(newData);
      onDataChange?.(newData);
      if (!previous || previous.number !== newData.number) {
        setAnimateNumber(true);
        setTimeout(() => setAnimateNumber(false), 1000);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError(true);

      // Notificar error si no es el montaje inicial
      if (latestDataRef.current !== null) {
        showNotification(
          "error",
          "Error al actualizar datos",
          "No se pudo obtener información actualizada de astronautas"
        );
      }
    } finally {
      setLoading(false);
      requestInFlightRef.current = false;
    }
  }, [onDataChange]);

  // Handler for the refresh button
  const handleRefreshClick = (): void => {
    fetchData();
  };

  // Handler for the countdown completion
  const handleCountdownComplete = (): void => {
    fetchData();
  };

  // Efecto para programar actualizaciones periódicas
  useEffect(() => {
    // Primera consulta inmediata. La cuenta atrás no debe reiniciar la carga inicial.
    void fetchData();

    // Programar actualizaciones periódicas
    const interval = setInterval(() => {
      void fetchData();
    }, AUTO_UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  return (
    <>
      {/* Componente de alerta para mostrar notificaciones */}
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertInfo.type}
        title={alertInfo.title}
        message={alertInfo.message}
        duration={8000}
      />

      <div className="w-full max-w-4xl mx-auto">
        <Card className="relative overflow-hidden bg-blue-950/80 border-blue-800 border shadow-xl card-hover">
          <div className="absolute w-full h-full top-0 left-0">
            <div className="stars"></div>
            <div className="stars2"></div>
            <div className="stars3"></div>
          </div>

          <div className="relative z-10 p-4 sm:p-8 text-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight link-hover">
                ¿Cuántas personas hay en el espacio ahora?
              </h2>
              <Button
                onClick={handleRefreshClick}
                disabled={loading}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-800/30 flex-shrink-0 ml-2 button-hover"
                title="Actualizar datos"
              >
                <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : "icon-hover"}`} />
              </Button>
            </div>

            <div className="mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 pulse-effect-slow"></div>
              <div className="absolute inset-2 rounded-full border-2 border-blue-400/20"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin-slow"></div>
              <motion.div
                aria-live="polite"
                aria-busy={data.message === "loading"}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-3xl sm:text-4xl md:text-5xl font-bold rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-center justify-center shadow-lg glow-effect"
                animate={animateNumber ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {data.number}
              </motion.div>
            </div>

            <div className="mb-3">
              <h3 className="text-blue-300 text-lg font-medium mb-1 flex items-center justify-center gap-2">
                <Users className="w-5 h-5 icon-hover floating" />
                <span>{data.message === "loading" ? "Consultando datos de astronautas..." : "Astronautas actualmente en el espacio"}</span>
              </h3>
              <p className="text-blue-200 text-sm">
                Consultamos el número de astronautas cada {AUTO_UPDATE_INTERVAL / 60000} minutos.
              </p>
            </div>

            <div className="bg-blue-900/30 backdrop-blur-sm p-3 rounded-lg mb-4 inline-block card-hover-glow">
              <UpdateCountdown
                onComplete={handleCountdownComplete}
                interval={AUTO_UPDATE_INTERVAL}
                className="text-blue-300 text-sm"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-white">
                <p>No se pudo actualizar en vivo; mostrando datos de respaldo.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
