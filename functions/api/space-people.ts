type PagesContext = {
  env: Record<string, string | undefined>;
};

type AstronautData = {
  name: string;
  craft: string;
};

type SpaceData = {
  number: number;
  people: AstronautData[];
  message: string;
};

const DEFAULT_API_URL = "https://api.open-notify.org/astros.json";

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

const jsonResponse = (data: unknown, cacheSeconds: number, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${cacheSeconds}`
    }
  });
};

const normalizeSpaceData = (data: unknown): SpaceData | null => {
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

export const onRequestGet = async ({ env }: PagesContext) => {
  const apiUrl = env.SPACE_PEOPLE_API || env.NEXT_PUBLIC_SPACE_PEOPLE_API || DEFAULT_API_URL;

  try {
    const response = await fetch(apiUrl, {
      headers: { accept: "application/json" }
    });

    if (response.ok) {
      const data = await response.json();
      const normalized = normalizeSpaceData(data);
      if (normalized) {
        return jsonResponse(normalized, 300);
      }
    }

    throw new Error("Invalid API response");
  } catch (error) {
    console.error("Failed to fetch space people:", error);
    return jsonResponse(fallbackData, 300);
  }
};
