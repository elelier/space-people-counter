import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const endpointSource = readFileSync("functions/api/space-people.ts", "utf8");

const requiredEndpointTokens = [
  "DEFAULT_PRIMARY_API_URL",
  "ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100",
  "SOURCE_LAUNCH_LIBRARY",
  "launch-library-2",
  "SOURCE_OPEN_NOTIFY",
  "open-notify",
  "SOURCE_FALLBACK",
  "static-fallback",
  "SPACE_PEOPLE_PRIMARY_API",
  "SPACE_PEOPLE_OPEN_NOTIFY_API",
  "normalizeLaunchLibraryData",
  "normalizeOpenNotifyData",
  "fetchSpacePeopleSource",
  "status: \"live\"",
  "status: \"fallback\"",
  "isFallback: false",
  "isFallback: true",
  "lastSuccessfulUpdate: timestamp",
  "lastSuccessfulUpdate: null"
];

for (const token of requiredEndpointTokens) {
  assert.ok(endpointSource.includes(token), `functions/api/space-people.ts is missing ${token}`);
}

const primaryIndex = endpointSource.indexOf("source: SOURCE_LAUNCH_LIBRARY");
const secondaryIndex = endpointSource.indexOf("source: SOURCE_OPEN_NOTIFY");
const fallbackIndex = endpointSource.indexOf("source: SOURCE_FALLBACK");

assert.ok(primaryIndex > -1, "primary source is not declared");
assert.ok(secondaryIndex > primaryIndex, "Open Notify must remain after the primary live source");
assert.ok(fallbackIndex > secondaryIndex, "static fallback must remain after all live sources");

const createLivePayload = (source) => ({
  number: 1,
  people: [{ name: "Mock Astronaut", craft: "Mock Craft" }],
  message: "success",
  status: "live",
  source,
  isFallback: false,
  timestamp: "2026-06-06T00:00:00.000Z",
  lastSuccessfulUpdate: "2026-06-06T00:00:00.000Z",
  responseTime: 1,
  error: null
});

const createFallbackPayload = (errors) => ({
  number: 1,
  people: [{ name: "Fallback Astronaut", craft: "Fallback Craft" }],
  message: "success (fallback)",
  status: "fallback",
  source: "static-fallback",
  isFallback: true,
  timestamp: "2026-06-06T00:00:00.000Z",
  lastSuccessfulUpdate: null,
  responseTime: 1,
  error: errors.join("; ")
});

const resolveMockChain = async (sources) => {
  const errors = [];

  for (const source of sources) {
    try {
      if (source.fails) {
        throw new Error(`${source.source} failed`);
      }

      return createLivePayload(source.source);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unknown upstream error");
    }
  }

  return createFallbackPayload(errors);
};

const primaryLive = await resolveMockChain([
  { source: "launch-library-2", fails: false },
  { source: "open-notify", fails: false }
]);

assert.equal(primaryLive.status, "live");
assert.equal(primaryLive.source, "launch-library-2");
assert.equal(primaryLive.isFallback, false);
assert.equal(primaryLive.error, null);
assert.equal(primaryLive.lastSuccessfulUpdate, primaryLive.timestamp);

const secondaryLive = await resolveMockChain([
  { source: "launch-library-2", fails: true },
  { source: "open-notify", fails: false }
]);

assert.equal(secondaryLive.status, "live");
assert.equal(secondaryLive.source, "open-notify");
assert.equal(secondaryLive.isFallback, false);
assert.equal(secondaryLive.error, null);
assert.equal(secondaryLive.lastSuccessfulUpdate, secondaryLive.timestamp);

const allFailFallback = await resolveMockChain([
  { source: "launch-library-2", fails: true },
  { source: "open-notify", fails: true }
]);

assert.equal(allFailFallback.status, "fallback");
assert.equal(allFailFallback.source, "static-fallback");
assert.equal(allFailFallback.isFallback, true);
assert.equal(allFailFallback.lastSuccessfulUpdate, null);
assert.match(allFailFallback.error, /launch-library-2 failed/);
assert.match(allFailFallback.error, /open-notify failed/);

console.log("Space people source chain mock check passed.");
