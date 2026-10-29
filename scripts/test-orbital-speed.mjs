import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const utilitySource = readFileSync(new URL("../src/lib/issOrbitalSpeed.ts", import.meta.url), "utf8");
// Exercise the actual TS helper without adding a runtime/test dependency.
const compiled = ts.transpileModule(utilitySource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const context = { exports: {} };
runInNewContext(compiled, context);
const { formatOrbitalSpeed } = context.exports;
const now = Date.UTC(2026, 9, 29, 12, 0, 0);
const live = {
  message: "success",
  status: "live",
  isFallback: false,
  source: "wheretheiss",
  timestamp: now,
  lastSuccessfulUpdate: new Date(now).toISOString(),
  velocity: 27554.2,
  units: "kilometers"
};
const display = (overrides = {}, at = now) => formatOrbitalSpeed({ ...live, ...overrides }, at);

test("shows orbital telemetry in km/h, rounded consistently", () => {
  assert.equal(display(), "27,554 km/h");
  assert.equal(display({ velocity: 27554.6 }), "27,555 km/h");
});

test("converts miles/hour according to upstream units", () => {
  assert.equal(display({ velocity: 17000, units: "miles" }), "27,359 km/h");
  assert.equal(display({ units: "furlongs" }), "No disponible");
  assert.equal(display({ units: undefined }), "No disponible");
});

test("never represents fallback or simulated constants as live measurements", () => {
  assert.equal(display({ status: "fallback", velocity: 27600 }), "No disponible");
  assert.equal(display({ isFallback: true }), "No disponible");
  assert.equal(display({ message: "success (simulated)" }), "No disponible");
});

test("rejects missing, invalid, negative and implausible velocities", () => {
  for (const velocity of [undefined, null, NaN, Infinity, -2, 0, 99999999]) {
    assert.equal(display({ velocity }), "No disponible");
  }
});

test("rejects stale, future and malformed sample timestamps", () => {
  assert.equal(display({}, now + 121000), "No disponible");
  assert.equal(display({ timestamp: now + 31000 }), "No disponible");
  assert.equal(display({ timestamp: Math.floor(now / 1000) }), "No disponible");
  assert.equal(display({ lastSuccessfulUpdate: new Date(now - 121000).toISOString() }), "No disponible");
  assert.equal(display({ lastSuccessfulUpdate: "not-a-date" }), "No disponible");
  assert.equal(display({ timestamp: now - 119000, lastSuccessfulUpdate: new Date(now - 119000).toISOString() }), "27,554 km/h");
});

test("panel and marker popup consume the exact same formatted prop", () => {
  const panel = readFileSync(new URL("../src/components/ISSMap.tsx", import.meta.url), "utf8");
  const popup = readFileSync(new URL("../src/components/MapComponent.tsx", import.meta.url), "utf8");
  assert.match(panel, /const orbitalSpeedDisplay = formatOrbitalSpeed\(issLocation\)/);
  assert.match(panel, /orbitalSpeedDisplay=\{orbitalSpeedDisplay\}/);
  assert.match(panel, />\{orbitalSpeedDisplay\}<\/div>/);
  assert.match(popup, /Velocidad orbital:<\/span> \{orbitalSpeedDisplay\}/);
  assert.doesNotMatch(popup, /haversine|calculatedSpeed|setSpeed\(/i);
});
