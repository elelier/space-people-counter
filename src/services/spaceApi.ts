interface AstronautData {
  name: string;
  craft: string;
}

export interface SpaceData {
  number: number;
  people: AstronautData[];
  message: string;
}

const DEFAULT_API_URL = "https://api.open-notify.org/astros.json";
const API_URL = process.env.NEXT_PUBLIC_SPACE_PEOPLE_API || DEFAULT_API_URL;
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedData: SpaceData | null = null;
let cacheTimestamp = 0;

// Datos de respaldo en caso de que la API falle
const fallbackData: SpaceData = {
  number: 12,
  message: "success (fallback)",
  people: [
    { name: "Oleg Kononenko", craft: "ISS" },
    { name: "Nikolai Chub", craft: "ISS" },
    { name: "Tracy Caldwell Dyson", craft: "ISS" },
    { name: "Matthew Dominick", craft: "ISS" },
    { name: "Michael Barratt", craft: "ISS" },
    { name: "Jeanette Epps", craft: "ISS" },
    { name: "Alexander Grebenkin", craft: "ISS" },
    { name: "Butch Wilmore", craft: "ISS" },
    { name: "Sunita Williams", craft: "ISS" },
    { name: "Li Guangsu", craft: "Tiangong" },
    { name: "Li Cong", craft: "Tiangong" },
    { name: "Ye Guangfu", craft: "Tiangong" }
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

  return { number, people, message };
}

export async function getPeopleInSpace(): Promise<SpaceData> {
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < CACHE_TTL_MS) {
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
    
    throw new Error('API response not successful');
  } catch (error) {
    console.error('Failed to fetch people in space:', error);
    // Usar datos de respaldo en caso de error
    cachedData = fallbackData;
    cacheTimestamp = now;
    return fallbackData;
  }
}
