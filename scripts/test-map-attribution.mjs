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
  const credit = getMapTileAttribution(true);

  assert.match(credit, /OpenStreetMap/);
  assert.match(credit, /contributors/);
  assert.match(credit, /https:\/\/www\.openstreetmap\.org\/copyright/);
  assert.doesNotMatch(credit, /CARTO/);
});

test('nighttime CARTO tiles credit both CARTO and OpenStreetMap', async () => {
  const { getMapTileAttribution } = await loadAttribution();
  const credit = getMapTileAttribution(false);

  assert.match(credit, /OpenStreetMap/);
  assert.match(credit, /contributors/);
  assert.match(credit, /https:\/\/www\.openstreetmap\.org\/copyright/);
  assert.match(credit, /CARTO/);
  assert.match(credit, /https:\/\/carto\.com\/attribution\//);
});
