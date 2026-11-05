import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const formatterSource = readFileSync(new URL('../src/lib/formatHistoricalDate.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(formatterSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const formatterUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
const { formatHistoricalDate } = await import(formatterUrl);

const milestoneSource = readFileSync(new URL('../src/services/historicalAstronautData.ts', import.meta.url), 'utf8');
const milestoneDates = [...milestoneSource.matchAll(/date:\s*"(\d{4}-\d{2}-\d{2})"/g)].map(match => match[1]);

test('calendar-only milestones display the intended day in Spanish', () => {
  assert.equal(formatHistoricalDate('1961-04-12'), '12 de abril de 1961');
  assert.equal(formatHistoricalDate('1961-05-05'), '5 de mayo de 1961');
  assert.equal(milestoneDates.length, 12);
});

test('all 12 milestone dates are identical in UTC, Mexico and Tokyo', () => {
  const expression = `const { formatHistoricalDate } = await import(${JSON.stringify(formatterUrl)}); console.log(JSON.stringify(${JSON.stringify(milestoneDates)}.map(date => formatHistoricalDate(date))));`;
  const renderInZone = (zone) => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', expression], {
    env: { ...process.env, TZ: zone },
    encoding: 'utf8'
  }).trim());

  const utc = renderInZone('UTC');
  assert.deepEqual(renderInZone('America/Mexico_City'), utc);
  assert.deepEqual(renderInZone('Asia/Tokyo'), utc);
  for (const [index, date] of milestoneDates.entries()) {
    const [year, month, day] = date.split('-').map(Number);
    const expected = new Intl.DateTimeFormat('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(Date.UTC(year, month - 1, day)));
    assert.equal(utc[index], expected);
  }
});

test('both historical milestone views use the timezone-safe formatter', () => {
  const modal = readFileSync(new URL('../src/components/SpaceMilestonesModal.tsx', import.meta.url), 'utf8');
  const timeline = readFileSync(new URL('../src/components/HistoricalAstronauts.tsx', import.meta.url), 'utf8');
  assert.match(modal, /formatHistoricalDate\(milestones\[selectedMilestone\]\.date\)/);
  assert.match(timeline, /formatHistoricalDate\(spaceMilestones\[selectedMilestone\]\.date\)/);
});


const durationSource = readFileSync(new URL('../src/lib/continuousHumanPresence.ts', import.meta.url), 'utf8');
const durationCompiled = ts.transpileModule(durationSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const { getContinuousHumanPresenceYears, CONTINUOUS_HUMAN_PRESENCE_START } = await import(
  'data:text/javascript;base64,' + Buffer.from(durationCompiled).toString('base64')
);

test('ISS habitation years use November 2, 2000 with UTC-safe anniversaries', () => {
  assert.equal(CONTINUOUS_HUMAN_PRESENCE_START, '2000-11-02');
  assert.equal(getContinuousHumanPresenceYears(new Date('2000-11-01T23:59:00Z')), 0);
  assert.equal(getContinuousHumanPresenceYears(new Date('2025-11-01T23:59:00Z')), 24);
  assert.equal(getContinuousHumanPresenceYears(new Date('2025-11-02T00:00:00Z')), 25);
  assert.equal(getContinuousHumanPresenceYears(new Date('2026-11-01T23:59:00Z')), 25);
  assert.equal(getContinuousHumanPresenceYears(new Date('2026-11-02T00:00:00Z')), 26);
  assert.equal(getContinuousHumanPresenceYears(new Date('2026-11-05T12:00:00Z')), 26);
  assert.equal(getContinuousHumanPresenceYears(new Date('2027-11-02T00:00:00Z')), 27);
});

test('Spanish milestone titles and descriptions are complete and dates unchanged', () => {
  const titles = [...milestoneSource.matchAll(/event:\s*"([^"]+)"/g)].map(match => match[1]);
  const desc = [...milestoneSource.matchAll(/description:\s*"([^"]+)"/g)].map(match => match[1]);
  assert.equal(titles.length, 12);
  assert.equal(desc.length, 12);
  assert.deepEqual(titles.slice(0, 4), [
    'Primer ser humano en el espacio', 'Primer estadounidense en el espacio',
    'Primera mujer en el espacio', 'Primera caminata espacial'
  ]);
  assert.equal(titles[6], 'Primera estación espacial estadounidense');
  for (const text of [...titles, ...desc]) {
    assert.doesNotMatch(text, /\b(?:First|became|launched|station was|spacecraft|arrived at|the Moon)\b/i);
  }
});

test('history images have accessible fallback, reset by milestone, and source attribution', () => {
  const shared = readFileSync(new URL('../src/components/HistoricalMilestoneImage.tsx', import.meta.url), 'utf8');
  const modal = readFileSync(new URL('../src/components/SpaceMilestonesModal.tsx', import.meta.url), 'utf8');
  const chart = readFileSync(new URL('../src/components/HistoricalAstronauts.tsx', import.meta.url), 'utf8');
  assert.match(shared, /onError=\{\(\) => setHasError\(true\)\}/);
  assert.match(shared, /Fotografía no disponible/);
  assert.match(shared, /Fuente y licencia/);
  assert.match(modal, /<HistoricalMilestoneImage[\s\S]*?key=\{milestones\[selectedMilestone\]\.date\}/);
  assert.match(chart, /<HistoricalMilestoneImage[\s\S]*?key=\{spaceMilestones\[selectedMilestone\]\.date\}/);
});

test('all history views avoid hardcoded 23 years and stale copyright', () => {
  const primary = readFileSync(new URL('../src/components/SimpleHistoricalData.tsx', import.meta.url), 'utf8');
  const chart = readFileSync(new URL('../src/components/HistoricalAstronauts.tsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
  for (const view of [primary, chart]) {
    assert.match(view, /useContinuousHumanPresenceYears\(\)/);
    assert.doesNotMatch(view, />23<\/span>/);
  }
  assert.doesNotMatch(footer, /© 2025/);
});


test('all 12 milestones use source-attributed Commons originals, not broken thumbs', () => {
  const images = [...milestoneSource.matchAll(/image:\s*"(https:\/\/[^"]+)"/g)].map(match => match[1]);
  const credits = [...milestoneSource.matchAll(/imageCredit:\s*"([^"]+)"/g)].map(match => match[1]);
  assert.equal(images.length, 12);
  assert.equal(credits.length, 12);
  for (const url of images) {
    assert.match(url, /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-f0-9]\/[a-f0-9]{2}\/[^"]+\.(?:jpg|png|svg)$/i);
    assert.doesNotMatch(url, /\/thumb\/|\d+px-/);
  }
  for (const credit of credits) assert.ok(credit.length >= 10);
  assert.match(credits[2], /Alexander Mokletsov.*CC BY-SA 3\.0/);
  assert.match(credits[10], /Shujianyang.*CC BY-SA 4\.0/);
});
