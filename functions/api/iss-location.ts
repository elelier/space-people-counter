type PagesContext = {
  env: Record<string, string | undefined>;
};

type ISSPosition = {
  latitude: string;
  longitude: string;
};

type DataStatus = "live" | "fallback";

type ISSLocationData = {
  iss_position: ISSPosition;
  message: string;
  timestamp: number;
  status: DataStatus;
  source: string;
  isFallback: boolean;
  lastSuccessfulUpdate: string | null;
  responseTime: number;
  error: string | null;
  altitude?: number;
  velocity?: number;
  visibility?: string;
  footprint?: number;
  solar_lat?: number;
  solar_lon?: number;
  units?: string;
};

const DEFAULT_ISS_API_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const SOURCE_WHERE_THE_ISS = "wheretheiss";
const SOURCE_SIMULATED_FALLBACK = "simulated-fallback";

const fallbackLocations: Array<{ lat: string; lng: string }> = [
  { lat: "28.4057", lng: "-80.6059" },
  { lat: "51.5074", lng: "-0.1278" },
  { lat: "35.6762", lng: "139.6503" },
  { lat: "-33.8688", lng: "151.2093" },
  { lat: "40.7128", lng: "-74.0060" },
  { lat: "37.7749", lng: "-122.4194" },
  { lat: "0.0", lng: "0.0" },
  { lat: "19.4326", lng: "-99.1332" },
  { lat: "-34.6037", lng: "-58.3816" },
  { lat: "55.7558", lng: "37.6173" }
];

const ORBIT_TIME_MS = 90 * 60 * 1000;

const jsonResponse = (data: unknown, cacheSeconds: number, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${cacheSeconds}`
    }
  });
};

const getFallbackLocation = (): ISSPosition => {
  const timestamp = Date.now();
  const index = Math.floor((timestamp % ORBIT_TIME_MS) / (ORBIT_TIME_MS / fallbackLocations.length));
  return {
    latitude: fallbackLocations[index].lat,
    longitude: fallbackLocations[index].lng
  };
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown upstream error";
};

export const onRequestGet = async ({ env }: PagesContext) => {
  const apiUrl = env.ISS_API || env.NEXT_PUBLIC_ISS_API || DEFAULT_ISS_API_URL;
  const startedAt = Date.now();

  try {
    const response = await fetch(apiUrl, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`ISS API responded with ${response.status}`);
    }

    const data = await response.json();
    const latitude = data.latitude?.toString();
    const longitude = data.longitude?.toString();

    if (!latitude || !longitude) {
      throw new Error("Invalid ISS API response");
    }

    const lastSuccessfulUpdate = new Date().toISOString();
    const issData: ISSLocationData = {
      message: "success",
      timestamp: Date.now(),
      status: "live",
      source: SOURCE_WHERE_THE_ISS,
      isFallback: false,
      lastSuccessfulUpdate,
      responseTime: Date.now() - startedAt,
      error: null,
      iss_position: {
        latitude,
        longitude
      },
      altitude: data.altitude,
      velocity: data.velocity,
      visibility: data.visibility,
      footprint: data.footprint,
      solar_lat: data.solar_lat,
      solar_lon: data.solar_lon,
      units: data.units
    };

    return jsonResponse(issData, 5);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Failed to fetch ISS location:", error);

    const fallbackPosition = getFallbackLocation();
    const simulatedData: ISSLocationData = {
      message: "success (simulated)",
      timestamp: Date.now(),
      status: "fallback",
      source: SOURCE_SIMULATED_FALLBACK,
      isFallback: true,
      lastSuccessfulUpdate: null,
      responseTime: Date.now() - startedAt,
      error: errorMessage,
      iss_position: fallbackPosition,
      altitude: 408,
      velocity: 27600,
      visibility: Math.random() > 0.5 ? "daylight" : "eclipsed",
      footprint: 4500
    };

    return jsonResponse(simulatedData, 5);
  }
};
