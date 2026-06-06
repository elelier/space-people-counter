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

const DEFAULT_API_URL = "https://api.open-notify.org/astros.json";
const SOURCE_OPEN_NOTIFY = "open-notify";
const SOURCE_FALLBACK = "static-fallback";

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

const normalizeSpaceData = (data: unknown): Pick<SpaceData, "number" | "people" | "message"> | null => {
  if (!data || typeof data !== "object") return null;

  const record = data as { people?: unknown; number?: unknown; message?: unknown };
  const people = Array.isArray(record.people)
    ? record.people
        .filter((person: any) => person && typeof person.name === "string" && typeof person.craft === "string")
        .map((person: any) => ({ name: person.name, craft: person.craft }))
    : [];

  const number = typeof record.number === "number" ? record.number : people.length;
  const message = typeof record.message === "string" ? record.message : "success";

  if (!people.length && number === 0) {
    return null;
  }

  return { number, people, message };
};

const withReliabilityMetadata = (
  data: Pick<SpaceData, "number" | "people" | "message">,
  metadata: Pick<SpaceData, "status" | "source" | "isFallback" | "timestamp" | "lastSuccessfulUpdate" | "responseTime" | "error">
): SpaceData => ({
  ...data,
  ...metadata
});

export const onRequestGet = async ({ env }: PagesContext) => {
  const apiUrl = env.SPACE_PEOPLE_API || env.NEXT_PUBLIC_SPACE_PEOPLE_API || DEFAULT_API_URL;
  const startedAt = Date.now();

  try {
    const response = await fetch(apiUrl, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Upstream responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const normalized = normalizeSpaceData(data);
    if (!normalized) {
      throw new Error("Invalid API response");
    }

    const timestamp = new Date().toISOString();
    return jsonResponse(
      withReliabilityMetadata(normalized, {
        status: "live",
        source: SOURCE_OPEN_NOTIFY,
        isFallback: false,
        timestamp,
        lastSuccessfulUpdate: timestamp,
        responseTime: Date.now() - startedAt,
        error: null
      }),
      300
    );
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Failed to fetch space people:", error);

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
  }
};
