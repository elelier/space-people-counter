type PagesContext = {
  env: Record<string, string | undefined>;
};

type AstronautData = {
  name: string;
  craft: string;
};

type DataStatus = "live" | "fallback";

type SpaceData = {
  number: number;
  people: AstronautData[];
  message: string;
  status: DataStatus;
  source: string;
  isFallback: boolean;
  timestamp: string;
  lastSuccessfulUpdate: string | null;
  responseTime: number;
  error: string | null;
};

type SpacePeopleSource = {
  source: string;
  url: string;
  normalize: (data: unknown) => Pick<SpaceData, "number" | "people" | "message"> | null;
};

const DEFAULT_PRIMARY_API_URL = "https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100";
const DEFAULT_OPEN_NOTIFY_API_URL = "https://api.open-notify.org/astros.json";
const SOURCE_LAUNCH_LIBRARY = "launch-library-2";
const SOURCE_OPEN_NOTIFY = "open-notify";
const SOURCE_CUSTOM = "custom-space-people-api";
const SOURCE_FALLBACK = "static-fallback";
const REQUEST_TIMEOUT_MS = 5000;

const fallbackPeople: AstronautData[] = [
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
];

const jsonResponse = (data: unknown, cacheSeconds: number, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${cacheSeconds}`
    }
  });
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown upstream error";
};

const getStringValue = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const getNamedObjectValue = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;
  return getStringValue((value as { name?: unknown }).name);
};

const getCraftFromLaunchLibraryPerson = (person: Record<string, unknown>): string => {
  const directCraft = getStringValue(person.craft) ?? getStringValue(person.current_craft);
  if (directCraft) return directCraft;

  const objectCraft = getNamedObjectValue(person.spacecraft) ?? getNamedObjectValue(person.space_station);
  if (objectCraft) return objectCraft;

  const lastFlight = person.last_flight;
  if (lastFlight && typeof lastFlight === "object") {
    const lastFlightCraft = getNamedObjectValue((lastFlight as Record<string, unknown>).spacecraft);
    if (lastFlightCraft) return lastFlightCraft;
  }

  const flights = person.flights;
  if (Array.isArray(flights)) {
    for (const flight of [...flights].reverse()) {
      if (flight && typeof flight === "object") {
        const flightCraft = getNamedObjectValue((flight as Record<string, unknown>).spacecraft);
        if (flightCraft) return flightCraft;
      }
    }
  }

  return "Unknown spacecraft";
};

const normalizeOpenNotifyData = (data: unknown): Pick<SpaceData, "number" | "people" | "message"> | null => {
  if (!data || typeof data !== "object") return null;

  const record = data as { people?: unknown; number?: unknown; message?: unknown };
  const people = Array.isArray(record.people)
    ? record.people
        .filter((person: unknown) => person && typeof person === "object")
        .map((person: unknown) => person as { name?: unknown; craft?: unknown })
        .filter((person) => typeof person.name === "string" && typeof person.craft === "string")
        .map((person) => ({ name: person.name as string, craft: person.craft as string }))
    : [];

  const number = typeof record.number === "number" ? record.number : people.length;
  const message = typeof record.message === "string" ? record.message : "success";

  if (!people.length && number === 0) {
    return null;
  }

  return { number, people, message };
};

const normalizeLaunchLibraryData = (data: unknown): Pick<SpaceData, "number" | "people" | "message"> | null => {
  if (!data || typeof data !== "object") return null;

  const record = data as { results?: unknown; count?: unknown };
  const rawPeople = Array.isArray(record.results) ? record.results : Array.isArray(data) ? data : [];

  const people = rawPeople
    .filter((person: unknown) => person && typeof person === "object")
    .map((person: unknown) => person as Record<string, unknown>)
    .filter((person) => person.in_space !== false)
    .map((person) => {
      const name = getStringValue(person.name);
      if (!name) return null;

      return {
        name,
        craft: getCraftFromLaunchLibraryPerson(person)
      };
    })
    .filter((person): person is AstronautData => person !== null);

  const number = typeof record.count === "number" ? record.count : people.length;

  if (!people.length && number === 0) {
    return null;
  }

  return { number, people, message: "success" };
};

const withReliabilityMetadata = (
  data: Pick<SpaceData, "number" | "people" | "message">,
  metadata: Pick<SpaceData, "status" | "source" | "isFallback" | "timestamp" | "lastSuccessfulUpdate" | "responseTime" | "error">
): SpaceData => ({
  ...data,
  ...metadata
});

const fetchWithTimeout = async (url: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
      cache: "no-store"
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchSpacePeopleSource = async (
  source: SpacePeopleSource
): Promise<Pick<SpaceData, "number" | "people" | "message" | "source">> => {
  const response = await fetchWithTimeout(source.url);

  if (!response.ok) {
    throw new Error(`${source.source} responded with HTTP ${response.status}`);
  }

  const data = await response.json();
  const normalized = source.normalize(data);
  if (!normalized) {
    throw new Error(`${source.source} returned invalid people data`);
  }

  return { ...normalized, source: source.source };
};

const uniqueSources = (sources: SpacePeopleSource[]): SpacePeopleSource[] => {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.source}:${source.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getSpacePeopleSources = (env: PagesContext["env"]): SpacePeopleSource[] => {
  const customUrl = env.SPACE_PEOPLE_API ?? env.NEXT_PUBLIC_SPACE_PEOPLE_API;

  return uniqueSources([
    {
      source: SOURCE_LAUNCH_LIBRARY,
      url: env.SPACE_PEOPLE_PRIMARY_API ?? DEFAULT_PRIMARY_API_URL,
      normalize: normalizeLaunchLibraryData
    },
    ...(customUrl
      ? [
          {
            source: SOURCE_CUSTOM,
            url: customUrl,
            normalize: normalizeOpenNotifyData
          }
        ]
      : []),
    {
      source: SOURCE_OPEN_NOTIFY,
      url: env.SPACE_PEOPLE_OPEN_NOTIFY_API ?? DEFAULT_OPEN_NOTIFY_API_URL,
      normalize: normalizeOpenNotifyData
    }
  ]);
};

export const onRequestGet = async ({ env }: PagesContext) => {
  const startedAt = Date.now();
  const errors: string[] = [];

  for (const source of getSpacePeopleSources(env)) {
    try {
      const data = await fetchSpacePeopleSource(source);
      const timestamp = new Date().toISOString();

      return jsonResponse(
        withReliabilityMetadata(
          {
            number: data.number,
            people: data.people,
            message: data.message
          },
          {
            status: "live",
            source: data.source,
            isFallback: false,
            timestamp,
            lastSuccessfulUpdate: timestamp,
            responseTime: Date.now() - startedAt,
            error: null
          }
        ),
        300
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      errors.push(errorMessage);
      console.error(`Failed to fetch space people from ${source.source}:`, error);
    }
  }

  const errorMessage = errors.join("; ") || "All upstream sources failed";

  return jsonResponse(
    withReliabilityMetadata(
      {
        number: fallbackPeople.length,
        message: "success (fallback)",
        people: fallbackPeople
      },
      {
        status: "fallback",
        source: SOURCE_FALLBACK,
        isFallback: true,
        timestamp: new Date().toISOString(),
        lastSuccessfulUpdate: null,
        responseTime: Date.now() - startedAt,
        error: errorMessage
      }
    ),
    300
  );
};
