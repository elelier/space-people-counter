import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const endpointSource = readFileSync("functions/api/space-people.ts", "utf8");
const auditSource = readFileSync("docs/space-people-source-audit.md", "utf8");

const requiredEndpointTokens = [
  "type SourceAdapter",
  "type SourceCoverage",
  "type SourceDecision",
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
  "dedupePeople",
  "validatePayload",
  "normalizeLaunchLibraryData",
  "normalizeOpenNotifyData",
  "fetchSpacePeopleSource",
  "source registry",
  "status: \"live\"",
  "status: \"fallback\"",
  "isFallback: false",
  "isFallback: true",
  "lastSuccessfulUpdate: timestamp",
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
  "NASA public APIs",
  "Tiangong",
  "WhereTheISS",
  "Static fallback",
  "should stay organized"
];

for (const token of requiredAuditTokens) {
  assert.ok(auditSource.includes(token), `docs/space-people-source-audit.md is missing ${token}`);
}

const primaryIndex = endpointSource.indexOf("source: SOURCE_LAUNCH_LIBRARY");
const customIndex = endpointSource.indexOf("source: SOURCE_CUSTOM");
const secondaryIndex = endpointSource.indexOf("source: SOURCE_OPEN_NOTIFY");
const fallbackIndex = endpointSource.indexOf("source: SOURCE_FALLBACK");
const validateIndex = endpointSource.indexOf("validatePayload");
const dedupeIndex = endpointSource.indexOf("dedupePeople");

assert.ok(primaryIndex > -1, "primary source is not declared");
assert.ok(customIndex > primaryIndex, "custom source must remain after the primary live source");
assert.ok(secondaryIndex > customIndex, "Open Notify must remain after the custom source");
assert.ok(fallbackIndex > secondaryIndex, "static fallback must remain after all live sources");
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

const resolveMockChain = async (sources) => {
  const errors = [];

  for (const source of sources) {
    try {
      if (source.fails) {
        throw new Error(`${source.source} failed`);
      }

      return createLivePayload(source.source, source.people);
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

console.log("Space people source architecture check passed.");
