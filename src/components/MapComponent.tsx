"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Solución para el problema de los iconos en SSR con Leaflet
const SpaceStationIcon = new L.Icon({
  // Usar una ruta local para el icono, asegurando que siempre esté disponible
  iconUrl: '/images/iss-icon.png',
  iconSize: [42, 42], // Ligeramente más pequeño para móviles
  iconAnchor: [21, 21],
  popupAnchor: [0, -21]
});

// Componente para actualizar la vista del mapa cuando cambian las coordenadas
function ChangeView({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);

  return null;
}

// Componente para dibujar la cuadrícula
function GridLines({ visible }: { visible: boolean }) {
  const map = useMap();
  const gridLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!visible) {
      if (gridLayerRef.current) {
        gridLayerRef.current.remove();
        gridLayerRef.current = null;
      }
      return;
    }

    // Si ya existe la cuadrícula y es visible, no hacemos nada
    if (gridLayerRef.current) return;

    // Crear líneas de latitud
    const latLines = [];
    for (let lat = -80; lat <= 80; lat += 20) { // Líneas más espaciadas para móviles
      const line = {
        type: "Feature" as const,
        properties: { value: lat, type: "latitude" },
        geometry: {
          type: "LineString" as const,
          coordinates: Array.from({ length: 19 }, (_, i) => [i * 20 - 180, lat])
        }
      };
      latLines.push(line);
    }

    // Crear líneas de longitud
    const lonLines = [];
    for (let lon = -180; lon <= 180; lon += 20) { // Líneas más espaciadas para móviles
      const line = {
        type: "Feature" as const,
        properties: { value: lon, type: "longitude" },
        geometry: {
          type: "LineString" as const,
          coordinates: Array.from({ length: 9 }, (_, i) => [lon, i * 20 - 80])
        }
      };
      lonLines.push(line);
    }

    // Definir el estilo de las líneas
    const style = {
      color: "#3b82f6",
      weight: 0.5,
      opacity: 0.5,
      fillOpacity: 0
    };

    // Añadir las líneas al mapa
    const gridLayer = L.geoJSON([...latLines, ...lonLines], { style });
    gridLayer.addTo(map);
    gridLayerRef.current = gridLayer;

    // Limpieza al desmontar
    return () => {
      if (gridLayerRef.current) {
        gridLayerRef.current.remove();
      }
    };
  }, [map, visible]);

  return null;
}

interface MapComponentProps {
  latitude: number;
  longitude: number;
  showGrid?: boolean;
  altitude?: number;
  velocity?: number;
  visibility?: string;
}

export default function MapComponent({
  latitude,
  longitude,
  showGrid = false,
  altitude = 408,
  velocity = 27600,
  visibility = "unknown"
}: MapComponentProps) {
  // Estado para determinar si estamos en el cliente o servidor
  const [isMounted, setIsMounted] = useState(false);
  // Estado para almacenar la velocidad calculada
  const [speed, setSpeed] = useState<number | null>(null);
  // Estado para detectar si es un dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);
  // Ref para almacenar la posición anterior y evitar ciclo infinito
  const prevPositionRef = useRef<[number, number] | null>(null);
  // Ref para almacenar la hora de la última actualización
  const lastUpdateRef = useRef<number | null>(null);

  // Garantizar que el componente solo renderice en el cliente
  useEffect(() => {
    setIsMounted(true);

    // Detectar si es un dispositivo móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Calcular velocidad aproximada basada en cambios de posición
  useEffect(() => {
    const prevPosition = prevPositionRef.current;
    const lastUpdate = lastUpdateRef.current;

    if (prevPosition && lastUpdate) {
      const now = Date.now();
      const timeDiff = (now - lastUpdate) / 1000; // en segundos

      if (timeDiff > 0) {
        // Distancia en kilómetros usando la fórmula del haversine
        const R = 6371; // Radio de la Tierra en km
        const dLat = ((latitude - prevPosition[0]) * Math.PI) / 180;
        const dLon = ((longitude - prevPosition[1]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((prevPosition[0] * Math.PI) / 180) *
            Math.cos((latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Velocidad en km/s * 3600 = km/h
        const calculatedSpeed = (distance / timeDiff) * 3600;
        setSpeed(calculatedSpeed);
      }
    }

    // Actualizar refs para la próxima vez
    prevPositionRef.current = [latitude, longitude];
    lastUpdateRef.current = Date.now();
  }, [latitude, longitude]);

  // Velocidad orbital típica de la ISS: 27,600 km/h o usar la proporcionada
  const displaySpeed = speed !== null && speed > 0 ? speed : velocity;

  // Determinar si es de día o de noche según el valor de visibilidad
  const isDayTime = visibility === "daylight";

  if (!isMounted) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] bg-blue-900/50 flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          {/* Animación de carga simple pero atractiva */}
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 border-4 border-blue-400 opacity-40 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-7 bg-blue-500 rounded-full"></div>
          </div>
          <p className="text-lg font-medium">Cargando mapa...</p>
          <p className="text-sm text-blue-300 mt-1">Preparando visualización de datos</p>
        </div>
      </div>
    );
  }

  // Determinar el estilo del mapa según si es día o noche
  const mapTileUrl = isDayTime
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    : "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";

  // Altura y zoom del mapa basados en el tamaño de la pantalla
  const mapHeight = isMobile ? "300px" : "400px";
  const mapZoom = isMobile ? 2 : 3;

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={mapZoom}
      scrollWheelZoom={true}
      style={{ height: mapHeight, width: "100%" }}
      className="z-0 bg-blue-950"
      attributionControl={false} // Ocultar atribución para ahorrar espacio en móviles
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={mapTileUrl}
      />
      <Marker position={[latitude, longitude]} icon={SpaceStationIcon}>
        <Popup className="iss-popup">
          <div className="text-center p-1">
            <div className="font-bold mb-2 text-blue-800 text-sm">Estación Espacial Internacional</div>
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">Ubicación:</span> {parseFloat(latitude.toFixed(4))}°, {parseFloat(longitude.toFixed(4))}°</div>
              <div><span className="font-medium">Velocidad:</span> ~{Math.round(displaySpeed)} km/h</div>
              <div><span className="font-medium">Altitud:</span> ~{Math.round(altitude)} km</div>
              <div><span className="font-medium">Visibilidad:</span> {visibility === "daylight" ? "Diurna" : (visibility === "eclipsed" ? "Nocturna" : "Desconocida")}</div>
            </div>
            {!isMobile && (
              <div className="text-xs mt-2 text-gray-500">Orbita la Tierra cada ~90 minutos</div>
            )}
          </div>
        </Popup>
      </Marker>
      <GridLines visible={showGrid} />
      <ChangeView latitude={latitude} longitude={longitude} />
    </MapContainer>
  );
}
