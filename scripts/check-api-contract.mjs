import { readFileSync } from "node:fs";

const requiredEndpointFields = [
  "source",
  "isFallback",
  "lastSuccessfulUpdate",
  "timestamp",
  "error",
  "status",
  "responseTime"
];

const checks = [
  {
    path: "functions/api/space-people.ts",
    fields: requiredEndpointFields,
    extra: ["open-notify", "fallback"]
  },
  {
    path: "functions/api/iss-location.ts",
    fields: requiredEndpointFields,
    extra: ["wheretheiss", "simulated"]
  },
  {
    path: "functions/api/health.ts",
    fields: requiredEndpointFields,
    extra: ["overall", "apis"]
  },
  {
    path: "src/services/spaceApi.ts",
    fields: ["source", "isFallback", "lastSuccessfulUpdate", "timestamp", "error", "status", "responseTime"],
    extra: ["SpaceData"]
  },
  {
    path: "src/services/issLocationApi.ts",
    fields: ["source", "isFallback", "lastSuccessfulUpdate", "timestamp", "error", "status", "responseTime"],
    extra: ["ISSLocationData", "iss_position"]
  },
  {
    path: "docs/api-data-reliability-contract.md",
    fields: ["/api/space-people", "/api/iss-location", "/api/health", "source", "isFallback"],
    extra: ["No Supabase", "No Core DB"]
  }
];

const failures = [];

for (const check of checks) {
  const content = readFileSync(check.path, "utf8");
  const requiredTokens = [...check.fields, ...check.extra];

  for (const token of requiredTokens) {
    if (!content.includes(token)) {
      failures.push(`${check.path} is missing contract token: ${token}`);
    }
  }
}

if (failures.length > 0) {
  console.error("API contract source check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("API contract source check passed.");
