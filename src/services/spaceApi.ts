interface AstronautData {
  name: string;
  craft: string;
}

export interface SpaceData {
  number: number;
  people: AstronautData[];
  message: string;
  status?: "live" | "fallback";
  source?: string;
  isFallback?: boolean;
  timestamp?: string;
  lastSuccessfulUpdate?: string | null;
  responseTime?: number;
  error?: string | null;
}

const API_URL = "/api/space-people";
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedData: SpaceData | null = null;
let cacheTimestamp = 0;

// Client-only fallback if /api/space-people cannot be reached at all.
// Snapshot from the 2026-06-06 source audit; always marked as stale fallback.
const fallbackData: SpaceData = {
  number: 10,
  message: "success (fallback; client stale snapshot)",
  status: "fallback",
  source: "client-static-fallback",
  isFallback: true,
  timestamp: new Date().toISOString(),
  lastSuccessfulUpdate: null,
  responseTime: 0,
  error: "Client could not reach /api/space-people",
  people: [
    { name: "Sergey Kud-Sverchkov", craft: "ISS" },
    { name: "Sophie Adenot", craft: "ISS" },
    { name: "Andrey Fedyaev", craft: "ISS" },
    { name: "Jack Hathaway", craft: "ISS" },
    { name: "Jessica Meir", craft: "ISS" },
    { name: "Sergei Mikayev", craft: "ISS" },
    { name: "Christopher Williams", craft: "ISS" },
    { name: "Zhu Yangzhu", craft: "Tiangong" },
    { name: "Zhang Zhiyuan", craft: "Tiangong" },
    { name: "Lai Ka-ying", craft: "Tiangong" }
  ]
};

function normalizeSpaceData(data: any): SpaceData | null {
  if (!data || typeof data !== "object") return null;

  const people = Array.isArray(data.people)
    ? data.people
        .filter((person: any) => person && typeof person.name === "string" && typeof person.craft === "string")
        .map((person: any) => ({ name: person.name, craft: person.craft }))
    : [];

  const number = typeof data.number === "number" ? data.number : people.length;
  const message = typeof data.message === "string" ? data.message : "success";

  if (!people.length && number === 0) {
    return null;
  }

  const isFallback = typeof data.isFallback === "boolean" ? data.isFallback : message.toLowerCase().includes("fallback");

  return {
    number,
    people,
    message,
    status: data.status === "fallback" || data.status === "live" ? data.status : isFallback ? "fallback" : "live",
    source: typeof data.source === "string" ? data.source : isFallback ? "unknown-fallback" : "unknown-live",
    isFallback,
    timestamp: typeof data.timestamp === "string" ? data.timestamp : new Date().toISOString(),
    lastSuccessfulUpdate: typeof data.lastSuccessfulUpdate === "string" ? data.lastSuccessfulUpdate : null,
    responseTime: typeof data.responseTime === "number" ? data.responseTime : 0,
    error: typeof data.error === "string" ? data.error : null
  };
}

export async function getPeopleInSpace(forceRefresh = false): Promise<SpaceData> {
  const now = Date.now();
  if (!forceRefresh && cachedData && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const normalized = normalizeSpaceData(data);
      if (normalized) {
        cachedData = normalized;
        cacheTimestamp = now;
        return normalized;
      }
    }

    throw new Error("API response not successful");
  } catch (error) {
    console.error("Failed to fetch people in space:", error);
    cachedData = {
      ...fallbackData,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : fallbackData.error
    };
    cacheTimestamp = now;
    return cachedData;
  }
}
