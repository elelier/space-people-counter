import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const BASE_URL = process.env.PREVIEW_URL || 'https://feat-issue-26-mobile-iss-tel.space-people-counter.pages.dev';
const out = 'qa-artifacts/issue-26';
const results = [];
await mkdir(out, { recursive: true });

const run = async (name, fn) => {
  try {
    await fn();
    console.log('[PASS]', name);
    results.push({ name, status: 'PASS' });
  } catch (e) {
    console.error('[FAIL]', name, e?.stack || String(e));
    results.push({ name, status: 'FAIL', error: String(e) });
  }
};
const overflow = async page => page.evaluate(() =>
  document.documentElement.scrollWidth - window.innerWidth
);

console.log('Issue #26 browser QA against Cloudflare Preview:', BASE_URL);
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const width of [320, 375, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
    });
    await context.route(/google-analytics\.com|googletagmanager\.com|\/g\/collect/, route => route.abort('blockedbyclient'));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await run('Mobile ' + width + 'px: toggle visibility, keyboard, telemetry, responsive', async () => {
      const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
      assert.equal(response?.status(), 200, 'Preview HTML status');
      const map = page.locator('#mapa-iss');
      const button = map.getByRole('button', { name: 'Ver datos ISS' });
      const panel = map.locator('#iss-telemetry-panel');
      await expect(map.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
      await expect(button).toBeVisible();
      assert.equal(await button.getAttribute('aria-controls'), 'iss-telemetry-panel');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toBeHidden();
      assert.ok((await overflow(page)) <= 12, 'Horizontal overflow collapsed: ' + await overflow(page));
      await map.screenshot({ path: out + '/mobile-' + width + '-collapsed.png' });

      await button.click();
      const closeButton = map.getByRole('button', { name: 'Ocultar datos ISS' });
      await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
      await expect(panel).toBeVisible();
      for (const label of ['Latitud', 'Longitud', 'Velocidad orbital', 'Altitud', 'Estado:', 'Última actualización']) {
        await expect(panel.getByText(label, { exact: label !== 'Estado:' }).first()).toBeVisible();
      }
      await page.waitForFunction(() => {
        const p = document.querySelector('#iss-telemetry-panel');
        return p && !p.textContent.includes('Actualizando...');
      }, { timeout: 25000 });
      assert.ok((await overflow(page)) <= 12, 'Horizontal overflow expanded: ' + await overflow(page));
      await map.screenshot({ path: out + '/mobile-' + width + '-expanded.png' });

      await closeButton.focus();
      await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toBeHidden();
      await button.focus();
      await page.keyboard.press('Space');
      await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
      await expect(panel).toBeVisible();

      if (width === 390) {
        // Controlled fixture applies only after verifying real preview load; never changes upstream.
        await page.route('**/api/iss-location', route => route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'success', timestamp: Date.now(), status: 'live',
            source: 'qa-controlled-refresh', isFallback: false,
            lastSuccessfulUpdate: new Date().toISOString(), responseTime: 0,
            error: null, iss_position: { latitude: '12.3456', longitude: '78.9012' },
            altitude: 420, velocity: 27600, visibility: 'daylight',
          }),
        }));
        await page.waitForTimeout(5600); // ISS client cache TTL = 5s.
        const refresh = map.getByRole('button', { name: 'Actualizar', exact: true });
        await expect(refresh).toBeEnabled();
        await refresh.click();
        await expect(panel.getByText('12.3456°', { exact: true })).toBeVisible({ timeout: 12000 });
        await expect(panel.getByText('78.9012°', { exact: true })).toBeVisible();
        await expect(panel.getByText('420 km', { exact: true })).toBeVisible();
        await expect(panel.getByText('Zona de día', { exact: false })).toBeVisible();
        await map.screenshot({ path: out + '/mobile-390-refreshed-controlled.png' });
      }

      assert.deepEqual(errors, [], 'Uncaught JS errors');
    });
    await context.close();
  }
  for (const width of [768, 1366]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.route(/google-analytics\.com|googletagmanager\.com|\/g\/collect/, route => route.abort('blockedbyclient'));
    const page = await context.newPage();
    await run('Desktop ' + width + 'px: panel remains visible; mobile control absent', async () => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const map = page.locator('#mapa-iss');
      await expect(map.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
      await expect(map.locator('#iss-telemetry-panel')).toBeVisible();
      await expect(map.getByRole('button', { name: 'Ver datos ISS' })).toBeHidden();
      await expect(map.getByText('Velocidad orbital', { exact: true }).first()).toBeVisible();
      assert.ok((await overflow(page)) <= 12, 'Horizontal overflow: ' + await overflow(page));
      await map.screenshot({ path: out + '/desktop-' + width + '.png' });
    });
    await context.close();
  }
} finally {
  await browser.close();
}
console.log('RESULTS', JSON.stringify(results, null, 2));
const fail = results.filter(x => x.status === 'FAIL');
console.log('SUMMARY', results.length - fail.length + '/' + results.length, 'PASS');
if (fail.length) process.exitCode = 1;