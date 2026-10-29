import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

async function loadAttribution() {
  const source = readFileSync(new URL('../src/lib/mapAttribution.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

test('daytime OpenStreetMap tiles credit their contributors with a license link', async () => {
  const { getMapTileAttribution } = await loadAttribution();
  const credit = getMapTileAttribution();

  assert.match(credit, /OpenStreetMap/);
  assert.match(credit, /contributors/);
  assert.match(credit, /https:\/\/www\.openstreetmap\.org\/copyright/);
  assert.doesNotMatch(credit, /CARTO/);
});

test('both map themes only credit the OpenStreetMap tiles actually used', async () => {
  const { getMapTileAttribution } = await loadAttribution();
  const credit = getMapTileAttribution();

  assert.match(credit, /OpenStreetMap/);
  assert.match(credit, /contributors/);
  assert.match(credit, /https:\/\/www\.openstreetmap\.org\/copyright/);
  assert.doesNotMatch(credit, /CARTO/);
});

test('the ISS map uses the canonical OSM tile service for both themes', () => {
  const map = readFileSync(new URL('../src/components/MapComponent.tsx', import.meta.url), 'utf8');

  assert.match(map, /url="https:\/\/tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png"/);
  assert.match(map, /const isNightTime = visibility === "eclipsed"/);
  assert.match(map, /key=\{isNightTime \? "night" : "day"\}/);
  assert.match(map, /className=\{isNightTime \? "iss-map-tiles-night" : undefined\}/);
  assert.match(map, /attribution=\{getMapTileAttribution\(\)\}/);
  assert.doesNotMatch(map, /cartodb|cartocdn|dark_all|API_KEY/i);
});

test('night styling affects map tiles without dimming the marker or attribution', () => {
  const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');

  assert.match(css, /\.iss-map-tiles-night\s+\.leaflet-tile\s*\{[^}]*filter:\s*invert\(/s);
  assert.doesNotMatch(css, /\.leaflet-container\s*\{[^}]*filter:/s);
});
