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
