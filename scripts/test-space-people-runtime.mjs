import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

// Run the actual Pages Functions on CI's Node 20 without a Workers emulator.
async function loadFunction(path) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

const { onRequestGet } = await loadFunction("../functions/api/space-people.ts");
const { onRequestGet: onHealthRequestGet } = await loadFunction("../functions/api/health.ts");

const originalFetch = globalThis.fetch;
const originalCaches = globalThis.caches;
const originalConsoleError = console.error;
const path = "https://spacepeople.example/api/space-people";

function fakeEdgeCache() {
  const entries = new Map();
  return {
    entries,
    default: {
      async match(request) {
        return entries.get(request.url)?.clone();
      },
      async put(request, response) {
        entries.set(request.url, response.clone());
      }
    }
  };
}

function liveSource() {
  return new Response(JSON.stringify({
    count: 2,
    results: [
      { name: "Astronaut A", in_space: true, space_station: { name: "ISS" } },
      { name: "Astronaut B", in_space: true, space_station: { name: "ISS" } }
    ]
  }), { status: 200, headers: { "content-type": "application/json" } });
}

function communitySource(people = [
  { name: "Astronaut A", iss: true, spacecraft: "Soyuz MS-29" },
  { name: "Astronaut B", iss: false, spacecraft: "Shenzhou 23" },
  { name: "Astronaut C", iss: false, spacecraft: "Artemis II" }
], number = people.length) {
  return new Response(JSON.stringify({ number, people }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

async function invoke(url = path) {
  return onRequestGet({ env: {}, request: new Request(url) });
}

test.after(() => {
  globalThis.fetch = originalFetch;
  globalThis.caches = originalCaches;
  console.error = originalConsoleError;
});

test("shares a valid live snapshot at the edge across visitors and query variations", async () => {
  const edge = fakeEdgeCache();
  globalThis.caches = edge;
  let upstreamCalls = 0;
  globalThis.fetch = async () => {
    upstreamCalls++;
    return communitySource();
  };

  const first = await (await invoke(`${path}?utm_source=one`)).json();
  const secondResponse = await invoke(`${path}?utm_source=two`);
  const second = await secondResponse.json();

  assert.equal(upstreamCalls, 1, "a second visitor must not consume another upstream request");
  assert.equal(second.source, "community-roster");
  assert.deepEqual(second.people.map(({ craft }) => craft), ["ISS", "Tiangong", "Artemis II"]);
  assert.equal(second.isFallback, false);
  assert.equal(second.lastSuccessfulUpdate, first.lastSuccessfulUpdate);
  assert.equal(second.timestamp, first.timestamp, "cached data must not masquerade as newly fetched");
  assert.match(secondResponse.headers.get("cache-control"), /max-age=300/);
  assert.equal(edge.entries.size, 1, "query parameters must not bypass the edge budget");
  assert.match([...edge.entries.values()][0].headers.get("cache-control"), /max-age=1800/);
});

test("backs off when both upstreams fail rather than retrying for each visitor", async () => {
  globalThis.caches = fakeEdgeCache();
  let upstreamCalls = 0;
  const expectedErrors = [];
  console.error = (message) => expectedErrors.push(String(message));
  globalThis.fetch = async (url) => {
    upstreamCalls++;
    return new Response("unavailable", {
      status: String(url).includes("thespacedevs") ? 429 : String(url).includes("open-notify") ? 521 : 503
    });
  };

  const first = await (await invoke()).json();
  const second = await (await invoke(`${path}?refresh=1`)).json();

  assert.equal(upstreamCalls, 3, "a cached degraded response must prevent repeated outbound calls");
  assert.equal(first.status, "fallback");
  assert.equal(second.source, "static-fallback");
  assert.equal(second.isFallback, true);
  assert.equal(second.lastSuccessfulUpdate, null);
  assert.equal(expectedErrors.length, 3);
  console.error = originalConsoleError;
});

test("preserves the live path when edge cache is unavailable or errors", async () => {
  let upstreamCalls = 0;
  const expectedErrors = [];
  console.error = (message) => expectedErrors.push(String(message));
  globalThis.fetch = async () => {
    upstreamCalls++;
    return communitySource();
  };

  globalThis.caches = undefined;
  const unbound = await (await invoke()).json();
  assert.equal(unbound.status, "live");

  globalThis.caches = {
    default: {
      async match() { throw new Error("cache read unavailable"); },
      async put() { throw new Error("cache write unavailable"); }
    }
  };
  const failing = await (await invoke()).json();
  assert.equal(failing.status, "live");
  assert.equal(upstreamCalls, 2);
  assert.equal(expectedErrors.length, 2);
  console.error = originalConsoleError;
});

test("caches health inspections so they do not exhaust the same upstream quota", async () => {
  const edge = fakeEdgeCache();
  globalThis.caches = edge;
  let upstreamCalls = 0;
  globalThis.fetch = async () => {
    upstreamCalls++;
    return new Response("{}", { status: 200 });
  };

  const first = await (await onHealthRequestGet({ request: new Request("https://spacepeople.example/api/health?check=1") })).json();
  const second = await (await onHealthRequestGet({ request: new Request("https://spacepeople.example/api/health?check=2") })).json();

  assert.equal(upstreamCalls, 4, "a second health check must not re-fetch all four upstreams");
  assert.ok(first.apis.some(({ source }) => source === "community-roster"));
  assert.equal(first.timestamp, second.timestamp);
  assert.equal(second.overall, "healthy");
  assert.equal(edge.entries.size, 1);
  assert.match([...edge.entries.values()][0].headers.get("cache-control"), /max-age=1800/);
});

test("rejects a count mismatch in the community roster and uses Launch Library 2", async () => {
  globalThis.caches = fakeEdgeCache();
  const requested = [];
  const errors = [];
  console.error = (message) => errors.push(String(message));
  globalThis.fetch = async (url) => {
    requested.push(String(url));
    return requested.length === 1 ? communitySource(undefined, 4) : liveSource();
  };

  const result = await (await invoke()).json();

  assert.match(requested[0], /corquaid\.github\.io\/international-space-station-APIs\/JSON\/people-in-space\.json/);
  assert.match(requested[1], /ll\.thespacedevs\.com/);
  assert.equal(result.source, "launch-library-2");
  assert.equal(result.status, "live");
  assert.equal(errors.length, 1);
  console.error = originalConsoleError;
});

test("rejects invalid station flags and duplicate crew without caching them as live", async () => {
  globalThis.caches = fakeEdgeCache();
  const errors = [];
  console.error = (message) => errors.push(String(message));
  const invalidRosters = [
    communitySource([{ name: "A", iss: "false", spacecraft: "Shenzhou 23" }]),
    communitySource([
      { name: "Duplicate", iss: true, spacecraft: "Crew Dragon" },
      { name: " Duplicate ", iss: true, spacecraft: "Crew Dragon" }
    ]),
    communitySource([{ name: "Missing craft", iss: false }])
  ];

  for (const invalidRoster of invalidRosters) {
    globalThis.caches = fakeEdgeCache();
    let calls = 0;
    globalThis.fetch = async () => (++calls === 1 ? invalidRoster.clone() : liveSource());
    const result = await (await invoke()).json();
    assert.equal(calls, 2);
    assert.equal(result.source, "launch-library-2");
  }
  assert.equal(errors.length, 3);
  console.error = originalConsoleError;
});
