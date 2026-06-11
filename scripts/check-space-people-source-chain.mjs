import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const endpointSource = readFileSync("functions/api/space-people.ts", "utf8");
const auditSource = readFileSync("docs/space-people-source-audit.md", "utf8");
const kvDocSource = readFileSync("docs/cloudflare-kv-last-known-good.md", "utf8");

const requiredEndpointTokens = [
  "type KVNamespaceLike",
  "type SourceAdapter",
  "type SourceCoverage",
  "type SourceDecision",
  "DEFAULT_PRIMARY_API_URL",
  "ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100",
  "SOURCE_LAUNCH_LIBRARY",
  "launch-library-2",
  "SOURCE_OPEN_NOTIFY",
  "open-notify",
  "SOURCE_LAST_KNOWN_GOOD",
  "last-known-good-cache",
  "SOURCE_FALLBACK",
  "static-fallback",
  "LAST_KNOWN_GOOD_CACHE_KEY",
  "space-people:last-known-good",
  "LAST_KNOWN_GOOD_TTL_MS",
  "SPACE_PEOPLE_KV",
  "SPACE_PEOPLE_PRIMARY_API",
  "SPACE_PEOPLE_OPEN_NOTIFY_API",
  "dedupePeople",
  "validatePayload",
  "normalizeLaunchLibraryData",
  "normalizeOpenNotifyData",
  "fetchSpacePeopleSource",
  "saveLastKnownGoodCache",
  "readLastKnownGoodCache",
  "source registry",
  "status: \"live\"",
  "status: \"fallback\"",
  "isFallback: false",
  "isFallback: true",
  "lastSuccessfulUpdate: timestamp",
  "lastSuccessfulUpdate: cached.lastSuccessfulUpdate",
  "lastSuccessfulUpdate: null",
  "success (fallback; stale snapshot)"
];

for (const token of requiredEndpointTokens) {
  assert.ok(endpointSource.includes(token), `functions/api/space-people.ts is missing ${token}`);
}

const requiredAuditTokens = [
  "Humans currently in orbit",
  "Suborbital flights are intentionally excluded",
  "Launch Library 2",
  "Open Notify",
  "Cloudflare KV",
  "last-known-good-cache",
  "NASA public APIs",
  "Tiangong",
  "WhereTheISS",
  "Static fallback",
  "should stay organized"
];

for (const token of requiredAuditTokens) {
  assert.ok(auditSource.includes(token), `docs/space-people-source-audit.md is missing ${token}`);
}

for (const token of ["SPACE_PEOPLE_KV", "space-people:last-known-good", "24h", "Verification checklist"]) {
  assert.ok(kvDocSource.includes(token), `docs/cloudflare-kv-last-known-good.md is missing ${token}`);
}

const primaryIndex = endpointSource.indexOf("source: SOURCE_LAUNCH_LIBRARY");
const customIndex = endpointSource.indexOf("source: SOURCE_CUSTOM");
const secondaryIndex = endpointSource.indexOf("source: SOURCE_OPEN_NOTIFY");
const cacheIndex = endpointSource.indexOf("source: SOURCE_LAST_KNOWN_GOOD");
const fallbackIndex = endpointSource.indexOf("source: SOURCE_FALLBACK");
const validateIndex = endpointSource.indexOf("validatePayload");
const dedupeIndex = endpointSource.indexOf("dedupePeople");

assert.ok(primaryIndex > -1, "primary source is not declared");
assert.ok(customIndex > primaryIndex, "custom source must remain after the primary live source");
assert.ok(secondaryIndex > customIndex, "Open Notify must remain after the custom source");
assert.ok(cacheIndex > secondaryIndex, "last-known-good cache must be resolved after all live sources");
assert.ok(fallbackIndex > cacheIndex, "static fallback must remain after last-known-good cache");
assert.ok(validateIndex > -1, "payload validation must exist");
assert.ok(dedupeIndex > -1, "people dedupe must exist");

const normalizeName = (name) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

const dedupePeople = (people) => {
  const seen = new Set();
  const deduped = [];

  for (const person of people) {
    const key = normalizeName(person.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push({ name: person.name.trim(), craft: person.craft.trim() || "Unknown spacecraft" });
  }

  return deduped;
};

const validatePayload = (payload, source) => {
  const people = dedupePeople(payload.people);

  if (!people.length) {
    throw new Error(`${source} returned no people`);
  }

  if (payload.number !== people.length) {
    throw new Error(`${source} count mismatch: number=${payload.number}, people.length=${people.length}`);
  }

  return { ...payload, number: people.length, people };
};

const createLivePayload = (source, people = [{ name: "Mock Astronaut", craft: "Mock Craft" }]) => {
  const validated = validatePayload({ number: people.length, people, message: "success" }, source);

  return {
    ...validated,
    status: "live",
    source,
    isFallback: false,
    timestamp: "2026-06-06T00:00:00.000Z",
    lastSuccessfulUpdate: "2026-06-06T00:00:00.000Z",
    responseTime: 1,
    error: null
  };
};

const createLastKnownGoodRecord = (livePayload, savedAt = "2026-06-06T00:05:00.000Z") => ({
  number: livePayload.number,
  people: livePayload.people,
  message: livePayload.message,
  source: livePayload.source,
  timestamp: livePayload.timestamp,
  savedAt,
  lastSuccessfulUpdate: livePayload.lastSuccessfulUpdate
});

const isValidLastKnownGoodRecord = (record, nowMs) => {
  if (!record || typeof record !== "object") return false;
  if (record.source !== "launch-library-2" && record.source !== "open-notify" && record.source !== "custom-space-people-api") {
    return false;
  }

  const savedAtMs = Date.parse(record.savedAt);
  const lastSuccessfulUpdateMs = Date.parse(record.lastSuccessfulUpdate);
  if (!Number.isFinite(savedAtMs) || !Number.isFinite(lastSuccessfulUpdateMs)) return false;
  if (nowMs - savedAtMs > 24 * 60 * 60 * 1000) return false;

  validatePayload({ number: record.number, people: record.people, message: record.message }, "last-known-good-cache");
  return true;
};

const createCachedPayload = (record, errors, nowMs) => ({
  number: record.number,
  people: record.people,
  message: record.message,
  status: "fallback",
  source: "last-known-good-cache",
  isFallback: true,
  timestamp: "2026-06-06T01:00:00.000Z",
  lastSuccessfulUpdate: record.lastSuccessfulUpdate,
  responseTime: 1,
  error: `${errors.join("; ")}; serving cached last-known-good data from ${record.source}; cacheAgeMs=${Math.max(
    0,
    nowMs - Date.parse(record.savedAt)
  )}; static fallback not used`
});

const createFallbackPayload = (errors) => ({
  number: 10,
  people: [{ name: "Fallback Astronaut", craft: "Fallback Craft" }],
  message: "success (fallback; stale snapshot)",
  status: "fallback",
  source: "static-fallback",
  isFallback: true,
  timestamp: "2026-06-06T00:00:00.000Z",
  lastSuccessfulUpdate: null,
  responseTime: 1,
  error: errors.join("; ")
});

const resolveMockChain = async (sources, options = {}) => {
  const errors = [];
  const nowMs = Date.parse(options.now ?? "2026-06-06T01:00:00.000Z");

  for (const source of sources) {
    try {
      if (source.fails) {
        throw new Error(`${source.source} failed`);
      }

      const livePayload = createLivePayload(source.source, source.people);
      return {
        response: livePayload,
        lastKnownGoodWrite: createLastKnownGoodRecord(livePayload)
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unknown upstream error");
    }
  }

  try {
    if (isValidLastKnownGoodRecord(options.lastKnownGoodRecord, nowMs)) {
      return {
        response: createCachedPayload(options.lastKnownGoodRecord, errors, nowMs),
        lastKnownGoodWrite: null
      };
    }
  } catch (error) {
    errors.push(error instanceof Error ? `last-known-good cache invalid: ${error.message}` : "last-known-good cache invalid");
  }

  errors.push("last-known-good cache unavailable or expired");
  return {
    response: createFallbackPayload(errors),
    lastKnownGoodWrite: null
  };
};

const primaryLiveResult = await resolveMockChain([
  { source: "launch-library-2", fails: false },
  { source: "open-notify", fails: false }
]);
const primaryLive = primaryLiveResult.response;

assert.equal(primaryLive.status, "live");
assert.equal(primaryLive.source, "launch-library-2");
assert.equal(primaryLive.isFallback, false);
assert.equal(primaryLive.error, null);
assert.equal(primaryLive.lastSuccessfulUpdate, primaryLive.timestamp);
assert.equal(primaryLiveResult.lastKnownGoodWrite.source, "launch-library-2");
assert.equal(primaryLiveResult.lastKnownGoodWrite.lastSuccessfulUpdate, primaryLive.timestamp);

const secondaryLiveResult = await resolveMockChain([
  { source: "launch-library-2", fails: true },
  { source: "open-notify", fails: false }
]);
const secondaryLive = secondaryLiveResult.response;

assert.equal(secondaryLive.status, "live");
assert.equal(secondaryLive.source, "open-notify");
assert.equal(secondaryLive.isFallback, false);
assert.equal(secondaryLive.error, null);
assert.equal(secondaryLive.lastSuccessfulUpdate, secondaryLive.timestamp);
assert.equal(secondaryLiveResult.lastKnownGoodWrite.source, "open-notify");

const dedupedPeople = dedupePeople([
  { name: "Jessica Meir", craft: "ISS" },
  { name: " Jessica   Meir ", craft: "ISS" },
  { name: "Sophie Adenot", craft: "ISS" }
]);

assert.equal(dedupedPeople.length, 2);
assert.deepEqual(
  dedupedPeople.map((person) => person.name),
  ["Jessica Meir", "Sophie Adenot"]
);

assert.throws(
  () => validatePayload({ number: 3, people: [{ name: "One", craft: "ISS" }], message: "success" }, "mock-source"),
  /count mismatch/
);

assert.throws(
  () =>
    validatePayload(
      {
        number: 3,
        people: [
          { name: "Jessica Meir", craft: "ISS" },
          { name: "Jessica Meir", craft: "ISS" },
          { name: "Sophie Adenot", craft: "ISS" }
        ],
        message: "success"
      },
      "mock-source"
    ),
  /count mismatch/
);

const allFailCachedResult = await resolveMockChain(
  [
    { source: "launch-library-2", fails: true },
    { source: "open-notify", fails: true }
  ],
  { lastKnownGoodRecord: primaryLiveResult.lastKnownGoodWrite }
);
const allFailCached = allFailCachedResult.response;

assert.equal(allFailCached.status, "fallback");
assert.equal(allFailCached.source, "last-known-good-cache");
assert.equal(allFailCached.isFallback, true);
assert.equal(allFailCached.lastSuccessfulUpdate, primaryLive.timestamp);
assert.match(allFailCached.error, /launch-library-2 failed/);
assert.match(allFailCached.error, /open-notify failed/);
assert.match(allFailCached.error, /serving cached last-known-good data/);

const expiredCacheFallbackResult = await resolveMockChain(
  [
    { source: "launch-library-2", fails: true },
    { source: "open-notify", fails: true }
  ],
  {
    lastKnownGoodRecord: createLastKnownGoodRecord(primaryLive, "2026-06-04T00:00:00.000Z"),
    now: "2026-06-06T01:00:00.000Z"
  }
);
const expiredCacheFallback = expiredCacheFallbackResult.response;

assert.equal(expiredCacheFallback.status, "fallback");
assert.equal(expiredCacheFallback.source, "static-fallback");
assert.equal(expiredCacheFallback.isFallback, true);
assert.equal(expiredCacheFallback.lastSuccessfulUpdate, null);
assert.match(expiredCacheFallback.error, /last-known-good cache unavailable or expired/);

const invalidCacheFallbackResult = await resolveMockChain(
  [
    { source: "launch-library-2", fails: true },
    { source: "open-notify", fails: true }
  ],
  {
    lastKnownGoodRecord: {
      ...primaryLiveResult.lastKnownGoodWrite,
      number: 999
    }
  }
);
const invalidCacheFallback = invalidCacheFallbackResult.response;

assert.equal(invalidCacheFallback.status, "fallback");
assert.equal(invalidCacheFallback.source, "static-fallback");
assert.equal(invalidCacheFallback.isFallback, true);
assert.equal(invalidCacheFallback.lastSuccessfulUpdate, null);
assert.match(invalidCacheFallback.error, /last-known-good cache invalid/);

const allFailFallbackResult = await resolveMockChain([
  { source: "launch-library-2", fails: true },
  { source: "open-notify", fails: true }
]);
const allFailFallback = allFailFallbackResult.response;

assert.equal(allFailFallback.status, "fallback");
assert.equal(allFailFallback.source, "static-fallback");
assert.equal(allFailFallback.isFallback, true);
assert.equal(allFailFallback.lastSuccessfulUpdate, null);
assert.match(allFailFallback.error, /launch-library-2 failed/);
assert.match(allFailFallback.error, /open-notify failed/);
assert.match(allFailFallback.error, /last-known-good cache unavailable or expired/);

console.log("Space people source architecture check passed.");
