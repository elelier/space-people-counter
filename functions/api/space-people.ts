type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type PagesContext = {
  env: Record<string, string | undefined> & { SPACE_PEOPLE_KV?: KVNamespaceLike };
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

type SpacePeoplePayload = Pick<SpaceData, "number" | "people" | "message">;

type CachedSpacePeoplePayload = SpacePeoplePayload & {
  originalSource: string;
  lastSuccessfulUpdate: string;
  savedAt: string;
  cacheAgeMs: number;
};

type SourceCoverage = "orbital-people" | "iss-only-or-open-notify-compatible";

type SourceDecision = "primary" | "secondary" | "custom";

type SourceAdapter = {
  source: string;
  label: string;
  url: string;
  coverage: SourceCoverage;
  decision: SourceDecision;
  normalize: (data: unknown) => SpacePeoplePayload | null;
};

const DEFAULT_PRIMARY_API_URL = "https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100";
const DEFAULT_OPEN_NOTIFY_API_URL = "https://api.open-notify.org/astros.json";
const SOURCE_LAUNCH_LIBRARY = "launch-library-2";
const SOURCE_OPEN_NOTIFY = "open-notify";
const SOURCE_CUSTOM = "custom-space-people-api";
const SOURCE_LAST_KNOWN_GOOD = "last-known-good-cache";
const SOURCE_FALLBACK = "static-fallback";
const LAST_KNOWN_GOOD_CACHE_KEY = "space-people:last-known-good";
const LAST_KNOWN_GOOD_TTL_SECONDS = 24 * 60 * 60;
const LAST_KNOWN_GOOD_TTL_MS = LAST_KNOWN_GOOD_TTL_SECONDS * 1000;
const REQUEST_TIMEOUT_MS = 5000;

// Static fallback snapshot from the 2026-06-06 source audit. It is intentionally marked as fallback/stale.
// Product semantics: humans currently in orbit aboard active stations or orbital missions; suborbital flights excluded.
const fallbackPeople: AstronautData[] = [
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

const getNameKey = (name: string): string => {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
};

const dedupePeople = (people: AstronautData[]): AstronautData[] => {
  const seen = new Set<string>();
  const deduped: AstronautData[] = [];

  for (const person of people) {
    const key = getNameKey(person.name);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    deduped.push({
      name: person.name.trim(),
      craft: person.craft.trim() || "Unknown spacecraft"
    });
  }

  return deduped;
};

const validatePayload = (payload: SpacePeoplePayload | null, source: string): SpacePeoplePayload | null => {
  if (!payload) return null;

  const people = dedupePeople(payload.people);
  if (!people.length) return null;

  if (payload.number !== people.length) {
    throw new Error(`${source} count mismatch: number=${payload.number}, people.length=${people.length}`);
  }

  return {
    ...payload,
    number: people.length,
    people
  };
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

const normalizeOpenNotifyData = (data: unknown): SpacePeoplePayload | null => {
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

  return validatePayload({ number, people, message }, SOURCE_OPEN_NOTIFY);
};

const normalizeLaunchLibraryData = (data: unknown): SpacePeoplePayload | null => {
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

  return validatePayload({ number, people, message: "success" }, SOURCE_LAUNCH_LIBRARY);
};

const withReliabilityMetadata = (
  data: SpacePeoplePayload,
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
  source: SourceAdapter
): Promise<SpacePeoplePayload & Pick<SpaceData, "source">> => {
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

const uniqueSources = (sources: SourceAdapter[]): SourceAdapter[] => {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.source}:${source.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// source registry: declared in priority order, then normalized/validated before any response is emitted.
const getSpacePeopleSources = (env: PagesContext["env"]): SourceAdapter[] => {
  const customUrl = env.SPACE_PEOPLE_API ?? env.NEXT_PUBLIC_SPACE_PEOPLE_API;

  return uniqueSources([
    {
      source: SOURCE_LAUNCH_LIBRARY,
      label: "The Space Devs / Launch Library 2",
      url: env.SPACE_PEOPLE_PRIMARY_API ?? DEFAULT_PRIMARY_API_URL,
      coverage: "orbital-people",
      decision: "primary",
      normalize: normalizeLaunchLibraryData
    },
    ...(customUrl
      ? [
          {
            source: SOURCE_CUSTOM,
            label: "Custom Open Notify-compatible people endpoint",
            url: customUrl,
            coverage: "iss-only-or-open-notify-compatible" as SourceCoverage,
            decision: "custom" as SourceDecision,
            normalize: normalizeOpenNotifyData
          }
        ]
      : []),
    {
      source: SOURCE_OPEN_NOTIFY,
      label: "Open Notify astronauts endpoint",
      url: env.SPACE_PEOPLE_OPEN_NOTIFY_API ?? DEFAULT_OPEN_NOTIFY_API_URL,
      coverage: "iss-only-or-open-notify-compatible",
      decision: "secondary",
      normalize: normalizeOpenNotifyData
    }
  ]);
};

const getLastKnownGoodCache = (env: PagesContext["env"]): KVNamespaceLike | null => {
  const cache = env.SPACE_PEOPLE_KV;
  if (!cache) return null;
  if (typeof cache.get !== "function" || typeof cache.put !== "function") return null;
  return cache;
};

const isIsoTimestamp = (value: string): boolean => Number.isFinite(Date.parse(value));

const parseLastKnownGoodCachePayload = (raw: string, now = Date.now()): CachedSpacePeoplePayload | null => {
  const data = JSON.parse(raw) as {
    number?: unknown;
    people?: unknown;
    message?: unknown;
    source?: unknown;
    timestamp?: unknown;
    savedAt?: unknown;
    lastSuccessfulUpdate?: unknown;
  };

  if (!data || typeof data !== "object") return null;

  const originalSource = getStringValue(data.source);
  const lastSuccessfulUpdate = getStringValue(data.lastSuccessfulUpdate) ?? getStringValue(data.timestamp);
  const savedAt = getStringValue(data.savedAt);

  if (!originalSource || !lastSuccessfulUpdate || !savedAt) return null;
  if (!isIsoTimestamp(lastSuccessfulUpdate) || !isIsoTimestamp(savedAt)) return null;

  const savedAtMs = Date.parse(savedAt);
  const cacheAgeMs = now - savedAtMs;
  if (!Number.isFinite(savedAtMs) || cacheAgeMs > LAST_KNOWN_GOOD_TTL_MS) return null;

  const people = Array.isArray(data.people)
    ? data.people
        .filter((person: unknown) => person && typeof person === "object")
        .map((person: unknown) => person as { name?: unknown; craft?: unknown })
        .filter((person) => typeof person.name === "string" && typeof person.craft === "string")
        .map((person) => ({ name: person.name as string, craft: person.craft as string }))
    : [];

  const number = typeof data.number === "number" ? data.number : people.length;
  const message = typeof data.message === "string" ? data.message : "success";
  const validated = validatePayload({ number, people, message }, SOURCE_LAST_KNOWN_GOOD);

  if (!validated) return null;

  return {
    ...validated,
    originalSource,
    lastSuccessfulUpdate,
    savedAt,
    cacheAgeMs: Math.max(0, cacheAgeMs)
  };
};

const saveLastKnownGoodCache = async (
  env: PagesContext["env"],
  data: SpacePeoplePayload & Pick<SpaceData, "source">,
  timestamp: string
): Promise<void> => {
  const cache = getLastKnownGoodCache(env);
  if (!cache) return;

  const payload = {
    number: data.number,
    people: data.people,
    message: data.message,
    source: data.source,
    timestamp,
    savedAt: new Date().toISOString(),
    lastSuccessfulUpdate: timestamp
  };

  try {
    await cache.put(LAST_KNOWN_GOOD_CACHE_KEY, JSON.stringify(payload), {
      expirationTtl: LAST_KNOWN_GOOD_TTL_SECONDS
    });
  } catch (error) {
    console.error("Failed to save space people last-known-good cache:", error);
  }
};

const readLastKnownGoodCache = async (
  env: PagesContext["env"],
  errors: string[]
): Promise<CachedSpacePeoplePayload | null> => {
  const cache = getLastKnownGoodCache(env);
  if (!cache) {
    errors.push("last-known-good cache unavailable: SPACE_PEOPLE_KV binding is not configured");
    return null;
  }

  try {
    const raw = await cache.get(LAST_KNOWN_GOOD_CACHE_KEY);
    if (!raw) {
      errors.push("last-known-good cache unavailable: no saved payload");
      return null;
    }

    const cached = parseLastKnownGoodCachePayload(raw);
    if (!cached) {
      errors.push("last-known-good cache unavailable: payload missing, invalid, or older than 24h TTL");
      return null;
    }

    return cached;
  } catch (error) {
    errors.push(`last-known-good cache read failed: ${getErrorMessage(error)}`);
    return null;
  }
};

const getUpstreamErrorMessage = (errors: string[]): string => {
  return errors.filter((error) => !error.startsWith("last-known-good cache")).join("; ") || "All upstream sources failed";
};

export const onRequestGet = async ({ env }: PagesContext) => {
  const startedAt = Date.now();
  const errors: string[] = [];

  for (const source of getSpacePeopleSources(env)) {
    try {
      const data = await fetchSpacePeopleSource(source);
      const timestamp = new Date().toISOString();

      await saveLastKnownGoodCache(env, data, timestamp);

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

  const cached = await readLastKnownGoodCache(env, errors);
  if (cached) {
    return jsonResponse(
      withReliabilityMetadata(
        {
          number: cached.number,
          people: cached.people,
          message: cached.message
        },
        {
          status: "fallback",
          source: SOURCE_LAST_KNOWN_GOOD,
          isFallback: true,
          timestamp: new Date().toISOString(),
          lastSuccessfulUpdate: cached.lastSuccessfulUpdate,
          responseTime: Date.now() - startedAt,
          error: `${getUpstreamErrorMessage(errors)}; serving cached last-known-good data from ${cached.originalSource}; cacheAgeMs=${cached.cacheAgeMs}; static fallback not used`
        }
      ),
      60
    );
  }

  const errorMessage = errors.join("; ") || "All upstream sources and last-known-good cache failed";

  return jsonResponse(
    withReliabilityMetadata(
      {
        number: fallbackPeople.length,
        message: "success (fallback; stale snapshot)",
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
