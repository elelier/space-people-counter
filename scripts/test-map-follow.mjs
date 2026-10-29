import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const map = readFileSync(new URL("../src/components/MapComponent.tsx", import.meta.url), "utf8");
const panel = readFileSync(new URL("../src/components/ISSMap.tsx", import.meta.url), "utf8");

test("dragging switches the map to exploration mode", () => {
  assert.match(map, /useMapEvents\(\{ dragstart: onExplore \}\)/);
  assert.match(panel, /const handleExplore = useCallback\(\(\) => setFollowISS\(false\), \[\]\)/);
  assert.match(panel, /onExplore=\{handleExplore\}/);
});

test("position updates only recenter when follow mode is enabled", () => {
  assert.match(map, /if \(followISS\) \{\s*map\.setView\(\[latitude, longitude\], map\.getZoom\(\)\)/);
  assert.match(map, /\[latitude, longitude, followISS, map\]/);
  assert.match(map, /<Marker position=\{\[latitude, longitude\]\}/);
});

test("the user can explicitly resume following without altering polling", () => {
  assert.match(panel, /const resumeFollowing = \(\) => setFollowISS\(true\)/);
  assert.match(panel, /onClick=\{resumeFollowing\}/);
  assert.match(panel, /Seguir ISS/);
  assert.match(panel, /Pausar datos/);
  assert.match(panel, /Reanudar datos/);
  assert.match(panel, /followISS=\{followISS\}/);
});

test("pausing skips fetching and resumes on the same 5-second cadence", () => {
  assert.match(panel, /if \(!autoUpdateActive\) return;\s*fetchISSLocation\(\);/);
  assert.match(panel, /setInterval\(fetchISSLocation, 5000\)/);
  assert.match(panel, /onClick=\{fetchISSLocation\}/);
});

test("tracking status is visible outside the collapsible mobile telemetry", () => {
  assert.match(panel, /role="status" aria-live="polite"/);
  assert.match(panel, /followISS \? "Siguiendo ISS" : "Explorando mapa"/);
  assert.match(panel, /\{!followISS && \(/);
  assert.match(map, /scrollWheelZoom=\{false\}/);
  assert.match(map, /attribution=\{getMapTileAttribution\(\)\}/);
});
