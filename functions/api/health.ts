type ApiStatus = {
  name: string;
  url: string;
  status: "online" | "offline" | "slow";
  responseTime: number;
  lastChecked: string;
  error?: string;
};

type HealthCheckResult = {
  overall: "healthy" | "degraded" | "down";
  apis: ApiStatus[];
  timestamp: string;
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

const checkApiHealth = async (name: string, url: string, timeout = 5000): Promise<ApiStatus> => {
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

    if (response.ok) {
      return {
        name,
        url,
        status: responseTime > 3000 ? "slow" : "online",
        responseTime,
        lastChecked: new Date().toISOString()
      };
    }

    return {
      name,
      url,
      status: "offline",
      responseTime,
      lastChecked: new Date().toISOString(),
      error: `HTTP ${response.status}`
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    return {
      name,
      url,
      status: "offline",
      responseTime,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const onRequestGet = async () => {
  const checks = await Promise.all([
    checkApiHealth("ISS Location (wheretheiss.at)", "https://api.wheretheiss.at/v1/satellites/25544"),
    checkApiHealth("People in Space (open-notify)", "https://api.open-notify.org/astros.json"),
    checkApiHealth("ISS Location Backup (open-notify)", "https://api.open-notify.org/iss-now.json")
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

  const result: HealthCheckResult = {
    overall,
    apis: checks,
    timestamp: new Date().toISOString()
  };

  return jsonResponse(result, 60);
};
