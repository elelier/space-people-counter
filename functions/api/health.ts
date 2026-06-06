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

export const onRequestGet = async () => {
  const startedAt = Date.now();
  const checks = await Promise.all([
    checkApiHealth("ISS Location (wheretheiss.at)", "https://api.wheretheiss.at/v1/satellites/25544", "wheretheiss"),
    checkApiHealth("People in Space (open-notify)", "https://api.open-notify.org/astros.json", "open-notify"),
    checkApiHealth("ISS Location Backup (open-notify)", "https://api.open-notify.org/iss-now.json", "open-notify")
  ]);

  const onlineCount = checks.filter((check) => check.status === "online").length;
  const slowCount = checks.filter((check) => check.status === "slow").length;

  let overall: HealthCheckResult["overall"];

  if (onlineCount >= 2) {
    overall = "healthy";
  } else if (onlineCount >= 1 || slowCount >= 1) {
    overall = "degraded";
  } else {
    overall = "down";
  }

  const errors = checks
    .filter((check) => check.error)
    .map((check) => `${check.name}: ${check.error}`);

  const successfulChecks = checks.filter((check) => check.lastSuccessfulUpdate);
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
