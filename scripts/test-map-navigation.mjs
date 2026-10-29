import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../src/components/MapComponent.tsx", import.meta.url), "utf8");
const mapContainer = source.match(/<MapContainer\b([\s\S]*?)\s*>/);

test("ISS map does not intercept mouse-wheel scrolling", () => {
  assert.ok(mapContainer, "MapContainer JSX must exist");
  assert.match(mapContainer[1], /\bscrollWheelZoom=\{false\}/);
});

test("ISS map limits zoom-out to level 2", () => {
  assert.ok(mapContainer, "MapContainer JSX must exist");
  assert.match(mapContainer[1], /\bminZoom=\{2\}/);
});
