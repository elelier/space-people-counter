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
    extra: [
      "launch-library-2",
      "open-notify",
      "fallback",
      "SourceAdapter",
      "validatePayload",
      "dedupePeople",
      "KVNamespaceLike",
      "SPACE_PEOPLE_KV",
      "LAST_KNOWN_GOOD_CACHE_KEY",
      "last-known-good-cache",
      "saveLastKnownGoodCache",
      "readLastKnownGoodCache"
    ]
  },
  {
    path: "functions/api/iss-location.ts",
    fields: requiredEndpointFields,
    extra: ["wheretheiss", "simulated"]
  },
  {
    path: "functions/api/health.ts",
    fields: requiredEndpointFields,
    extra: ["overall", "apis", "People in Space cache (KV binding)", "SPACE_PEOPLE_KV", "last-known-good-cache"]
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
    extra: ["launch-library-2", "No Supabase", "No Core DB", "Source architecture", "SPACE_PEOPLE_KV", "last-known-good-cache"]
  },
  {
    path: "docs/space-people-source-audit.md",
    fields: ["Launch Library 2", "Open Notify", "NASA public APIs", "Tiangong", "WhereTheISS", "Static fallback"],
    extra: ["Humans currently in orbit", "should stay organized", "Cloudflare KV", "last-known-good-cache"]
  },
  {
    path: "docs/cloudflare-kv-last-known-good.md",
    fields: ["SPACE_PEOPLE_KV", "space-people:last-known-good", "last-known-good-cache", "24h"],
    extra: ["Manual Cloudflare setup", "Verification checklist"]
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
