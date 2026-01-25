export interface ISSLocationData {
  iss_position: {
    latitude: string;
    longitude: string;
  };
  message: string;
  timestamp: number;
  altitude?: number;
  velocity?: number;
  visibility?: string;
  footprint?: number;
  solar_lat?: number;
  solar_lon?: number;
  units?: string;
}

const ISS_API_URL = "/api/iss-location";

// Cache for ISS location data to reduce API calls
let issLocationCache: ISSLocationData | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds cache TTL

// Datos de respaldo en caso de que la API falle
// Coordenadas aproximadas de la ISS en diferentes momentos
const fallbackLocations: Array<{lat: string, lng: string}> = [
  { lat: "28.4057", lng: "-80.6059" },  // Kennedy Space Center
  { lat: "51.5074", lng: "-0.1278" },   // Londres
  { lat: "35.6762", lng: "139.6503" },  // Tokio
  { lat: "-33.8688", lng: "151.2093" }, // Sydney
  { lat: "40.7128", lng: "-74.0060" },  // Nueva York
  { lat: "37.7749", lng: "-122.4194" }, // San Francisco
  { lat: "0.0", lng: "0.0" },           // Punto origen (Oceano Atlántico)
  { lat: "19.4326", lng: "-99.1332" },  // Ciudad de México
  { lat: "-34.6037", lng: "-58.3816" }, // Buenos Aires
  { lat: "55.7558", lng: "37.6173" }    // Moscú
];

// Tiempo estimado para una órbita completa en millisegundos (90 minutos)
const ORBIT_TIME_MS = 90 * 60 * 1000;

// Obtener una ubicación de respaldo basada en el tiempo
function getFallbackLocation(): {latitude: string, longitude: string} {
  const timestamp = Date.now();
  const index = Math.floor((timestamp % ORBIT_TIME_MS) / (ORBIT_TIME_MS / fallbackLocations.length));
  return {
    latitude: fallbackLocations[index].lat,
    longitude: fallbackLocations[index].lng
  };
}

/**
 * Get the current ISS location from the wheretheiss.at API
 * @returns Promise<ISSLocationData> with ISS location data
 */
export async function getISSLocation(): Promise<ISSLocationData> {
  const currentTime = Date.now();

  // Return cached data if it's still valid
  if (issLocationCache && (currentTime - lastCacheTime < CACHE_TTL)) {
    console.log('Using cached ISS location data');
    return issLocationCache;
  }

  try {
    // Primary API: wheretheiss.at - More reliable and provides additional data
    console.log('Fetching from ISS API...');
    const response = await fetch(ISS_API_URL, {
      cache: 'no-store', // Always get fresh data
    });

    if (response.ok) {
      const data = await response.json();

      // Convert to our internal format
      const issData: ISSLocationData = {
        message: "success",
        timestamp: Date.now(),
        iss_position: {
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString()
        },
        altitude: data.altitude,
        velocity: data.velocity,
        visibility: data.visibility,
        footprint: data.footprint,
        solar_lat: data.solar_lat,
        solar_lon: data.solar_lon,
        units: data.units
      };

      // Update cache
      issLocationCache = issData;
      lastCacheTime = currentTime;

      console.log('Successfully fetched ISS location from wheretheiss.at');
      return issData;
    } else {
      throw new Error(`wheretheiss.at API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('wheretheiss.at API failed:', error);
    
    // Si la API falla, usar datos de respaldo simulados
    const fallbackPosition = getFallbackLocation();
    console.warn('Using simulated ISS location data');

    const simulatedData: ISSLocationData = {
      message: "success (simulated)",
      timestamp: Date.now(),
      iss_position: fallbackPosition,
      altitude: 408, // Approximate ISS altitude in km
      velocity: 27600, // Approximate ISS velocity in km/h
      visibility: Math.random() > 0.5 ? "daylight" : "eclipsed",
      footprint: 4500, // Approximate ISS footprint
    };

    // Update cache with simulated data
    issLocationCache = simulatedData;
    lastCacheTime = currentTime;

    return simulatedData;
  }
}
