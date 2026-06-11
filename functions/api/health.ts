type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type PagesContext = {
  env: Record<string, string | undefined> & { SPACE_PEOPLE_KV?: KVNamespaceLike };
};

type ApiStatus = {
  name: string;
  url: string;
  status: "online" | "offline" | "slow";
  responseTime: number;
  lastChecked: string;
  source: string;
  isFallback: boolean;
  lastSuccessfulUpdate: string | null;
  error: string | null;
};

type HealthCheckResult = {
  overall: "healthy" | "degraded" | "down";
  status: "healthy" | "degraded" | "down";
  source: string;
  isFallback: boolean;
  apis: ApiStatus[];
  timestamp: string;
  lastSuccessfulUpdate: string | null;
  responseTime: number;
  error: string | null;
};

const SPACE_PEOPLE_PRIMARY_API = "https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100";
const LAST_KNOWN_GOOD_CACHE_KEY = "space-people:last-known-good";
const SOURCE_LAST_KNOWN_GOOD = "last-known-good-cache";

const jsonResponse = (data: unknown, cacheSeconds: number, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${cacheSeconds}`
    }
  });
};

const checkApiHealth = async (name: string, url: string, source: string, timeout = 5000): Promise<ApiStatus> => {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store"
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const lastChecked = new Date().toISOString();

    if (response.ok) {
      return {
        name,
        url,
        source,
        status: responseTime > 3000 ? "slow" : "online",
        responseTime,
        lastChecked,
        isFallback: false,
        lastSuccessfulUpdate: lastChecked,
        error: null
      };
    }

    return {
      name,
      url,
      source,
      status: "offline",
      responseTime,
      lastChecked,
      isFallback: false,
      lastSuccessfulUpdate: null,
      error: `HTTP ${response.status}`
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    return {
      name,
      url,
      source,
      status: "offline",
      responseTime,
      lastChecked: new Date().toISOString(),
      isFallback: false,
      lastSuccessfulUpdate: null,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

const checkLastKnownGoodBinding = (env: PagesContext["env"]): ApiStatus => {
  const lastChecked = new Date().toISOString();
  const hasBinding =
    Boolean(env.SPACE_PEOPLE_KV) &&
    typeof env.SPACE_PEOPLE_KV?.get === "function" &&
    typeof env.SPACE_PEOPLE_KV?.put === "function";

  return {
    name: "People in Space cache (KV binding)",
    url: `cloudflare-kv://SPACE_PEOPLE_KV/${LAST_KNOWN_GOOD_CACHE_KEY}`,
    status: hasBinding ? "online" : "offline",
    responseTime: 0,
    lastChecked,
    source: SOURCE_LAST_KNOWN_GOOD,
    isFallback: false,
    lastSuccessfulUpdate: hasBinding ? lastChecked : null,
    error: hasBinding ? null : "Optional SPACE_PEOPLE_KV binding is not configured; dev/local health is still based on live APIs."
  };
};

export const onRequestGet = async ({ env }: PagesContext) => {
  const startedAt = Date.now();
  const upstreamChecks = await Promise.all([
    checkApiHealth("ISS Location (wheretheiss.at)", "https://api.wheretheiss.at/v1/satellites/25544", "wheretheiss"),
    checkApiHealth("People in Space (launch-library-2)", SPACE_PEOPLE_PRIMARY_API, "launch-library-2"),
    checkApiHealth("People in Space (open-notify)", "https://api.open-notify.org/astros.json", "open-notify")
  ]);
  const cacheCheck = checkLastKnownGoodBinding(env);
  const checks = [...upstreamChecks, cacheCheck];

  const onlineCount = upstreamChecks.filter((check) => check.status === "online").length;
  const slowCount = upstreamChecks.filter((check) => check.status === "slow").length;

  let overall: HealthCheckResult["overall"];

  if (onlineCount >= 2) {
    overall = "healthy";
  } else if (onlineCount >= 1 || slowCount >= 1) {
    overall = "degraded";
  } else {
    overall = "down";
  }

  const errors = upstreamChecks
    .filter((check) => check.error)
    .map((check) => `${check.name}: ${check.error}`);

  const successfulChecks = upstreamChecks.filter((check) => check.lastSuccessfulUpdate);
  const result: HealthCheckResult = {
    overall,
    status: overall,
    source: "cloudflare-pages-functions-health-check",
    isFallback: false,
    apis: checks,
    timestamp: new Date().toISOString(),
    lastSuccessfulUpdate: successfulChecks.length > 0 ? new Date().toISOString() : null,
    responseTime: Date.now() - startedAt,
    error: errors.length > 0 ? errors.join("; ") : null
  };

  return jsonResponse(result, 60);
};
