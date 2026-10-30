import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const BASE_URL = (process.env.SPACE_PEOPLE_BASE_URL || 'https://spacepeople.elelier.com').replace(/\/$/, '');
const SCREENSHOTS_DIR = 'qa-artifacts';
const TIMEOUT = 30000;
const report = [];
const warn = (name, detail) => { report.push({ name, status: 'WARN', detail }); console.warn('[WARN]', name, detail); };
const pass = (name, detail = '') => { report.push({ name, status: 'PASS', detail }); console.log('[PASS]', name, detail); };
const check = async (name, fn) => {
  try { await fn(); pass(name); } catch (err) {
    report.push({ name, status: 'FAIL', detail: err.message });
    console.error('[FAIL]', name, err);
  }
};
const httpGet = async (path) => {
  const response = await fetch(BASE_URL + path, {
    headers: { accept: path.startsWith('/api/') ? 'application/json' : 'text/html, */*' },
    signal: AbortSignal.timeout(TIMEOUT),
    cache: 'no-store'
  });
  assert.equal(response.status, 200, `${path}: expected HTTP 200, got ${response.status}`);
  return response;
};

console.log('Space People Counter post-release smoke:', BASE_URL, new Date().toISOString());
let livePeople;
let liveISS;
await check('homepage HTTP and HTML', async () => {
  const html = await (await httpGet('/')).text();
  assert.match(html, /¿Cuántas personas hay en el espacio ahora\?/);
  assert.match(html, /<title>/i);
  assert.match(html, /spacepeople\.elelier\.com/);
  assert.match(html, /property="og:image"/i);
  assert.match(html, /rel="canonical"/i);
});
await check('Cloudflare API /api/space-people contract', async () => {
  const response = await httpGet('/api/space-people');
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  const body = await response.json();
  assert.ok(Number.isInteger(body.number) && body.number > 0);
  assert.ok(Array.isArray(body.people) && body.people.length === body.number);
  assert.ok(body.people.every(p => typeof p.name === 'string' && typeof p.craft === 'string'));
  assert.ok(['live', 'fallback'].includes(body.status));
  assert.equal(typeof body.source, 'string');
  assert.equal(typeof body.isFallback, 'boolean');
  livePeople = body;
  if (body.isFallback) warn('space people source', `fallback returned by production: ${body.source}`);
});
await check('Cloudflare API /api/iss-location contract', async () => {
  const body = await (await httpGet('/api/iss-location')).json();
  const lat = Number(body?.iss_position?.latitude), lng = Number(body?.iss_position?.longitude);
  assert.ok(Number.isFinite(lat) && Math.abs(lat) <= 90);
  assert.ok(Number.isFinite(lng) && Math.abs(lng) <= 180);
  assert.ok(['live', 'fallback'].includes(body.status));
  assert.equal(typeof body.isFallback, 'boolean');
  liveISS = body;
  if (body.isFallback) warn('ISS source', 'simulated ISS position; not a live orbital location');
});
await check('Cloudflare API /api/health contract', async () => {
  const body = await (await httpGet('/api/health')).json();
  assert.ok(['healthy', 'degraded', 'down'].includes(body.overall));
  assert.ok(Array.isArray(body.apis) && body.apis.length >= 3);
  assert.equal(typeof body.source, 'string');
  if (body.overall !== 'healthy') warn('upstream health', body.overall);
});
await check('robots.txt and sitemap.xml', async () => {
  const robots = await (await httpGet('/robots.txt')).text();
  const sitemap = await (await httpGet('/sitemap.xml')).text();
  assert.match(robots, /sitemap\.xml/i);
  assert.match(robots, /disallow:\s*\/api\//i);
  assert.match(sitemap, /<loc>https:\/\/spacepeople\.elelier\.com\/?<\/loc>/i);
});

await mkdir(SCREENSHOTS_DIR, { recursive: true });
let browser;
try {
  const { chromium } = await import('@playwright/test');
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, permissions: ['clipboard-read', 'clipboard-write'] });
  await context.route(/google-analytics\.com|googletagmanager\.com|\/g\/collect/, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.on('pageerror', err => errors.push(err.message));

  await check('desktop hydration, roster, and map', async () => {
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.getByText('Ubicación de la ISS', { exact: true }).waitFor({ timeout: 20000 });
    await page.locator('.leaflet-container').first().waitFor({ timeout: 20000 });
    await page.locator('.leaflet-marker-icon').first().waitFor({ timeout: 12000 });
    await page.locator('.leaflet-control-attribution').first().waitFor();
    const attribution = await page.locator('.leaflet-control-attribution').first().innerText();
    assert.match(attribution, /OpenStreetMap/i);
    // Leaflet DOM alone can be present while tile downloads are broken.
    const loadedTile = page.locator('img.leaflet-tile-loaded').first();
    await loadedTile.waitFor({ timeout: 20000 });
    assert.ok(await loadedTile.evaluate(img => img.complete && img.naturalWidth > 0), 'map tile image did not load');
    await page.locator('#misiones').first().waitFor();
    await page.locator('#historial').first().waitFor();
    await page.locator('[aria-live="polite"][aria-busy="false"]').first().waitFor({ timeout: 20000 });
    const number = Number((await page.locator('[aria-live="polite"][aria-busy="false"]').first().innerText()).trim());
    if (livePeople) assert.equal(number, livePeople.number);
    await page.screenshot({ path: SCREENSHOTS_DIR + '/desktop-production.png', fullPage: true });
    assert.deepEqual(errors, [], 'Uncaught JavaScript page errors');
  });
  await check('counter initial zero before API response (controlled latency)', async () => {
    assert.ok(livePeople, 'requires validated production roster fixture');
    const zeroContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    try {
      await zeroContext.route('**/api/space-people', async route => {
        await new Promise(resolve => setTimeout(resolve, 2200));
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(livePeople) });
      });
      await zeroContext.route(/google-analytics\\.com|googletagmanager\\.com|\\/g\\/collect/, route => route.abort('blockedbyclient'));
      const zeroPage = await zeroContext.newPage();
      await zeroPage.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
      const counter = zeroPage.locator('[aria-live="polite"][aria-busy="true"]').first();
      await counter.waitFor({ timeout: 7000 });
      assert.equal((await counter.innerText()).trim(), '0');
      await zeroPage.locator('[aria-live="polite"][aria-busy="false"]').first().waitFor({ timeout: 15000 });
    } finally {
      await zeroContext.close();
    }
  });
  await check('map drag pauses follow and resume works', async () => {
    const map = page.locator('.leaflet-container').first();
    await map.scrollIntoViewIfNeeded();
    assert.match(await page.locator('#mapa-iss [role="status"]').first().innerText(), /Siguiendo ISS/);
    const bounds = await map.boundingBox();
    assert.ok(bounds && bounds.width > 100);
    const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 65, y + 35, { steps: 8 });
    await page.mouse.up();
    await page.getByText('Explorando mapa', { exact: false }).first().waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: 'Seguir ISS' }).click();
    await page.getByText('Siguiendo ISS', { exact: false }).first().waitFor({ timeout: 5000 });
    const zoom = page.locator('.leaflet-control-zoom-in').first();
    assert.ok(await zoom.isVisible());
    await zoom.click();
  });
  await check('share button copies canonical link (GA4 blocked)', async () => {
    await page.getByRole('button', { name: 'Compartir esta página' }).click();
    await page.getByText('Enlace copiado.', { exact: false }).first().waitFor({ timeout: 7000 });
    const copied = await page.evaluate(async () => navigator.clipboard.readText());
    assert.equal(copied, 'https://spacepeople.elelier.com/');
  });
  await check('mobile responsive and astronaut sections', async () => {
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await mobile.route(/google-analytics\.com|googletagmanager\.com|\/g\/collect/, route => route.abort('blockedbyclient'));
    const mpage = await mobile.newPage();
    mpage.on('pageerror', err => errors.push(err.message));
    await mpage.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await mpage.locator('.leaflet-container').first().waitFor({ timeout: 20000 });
    await mpage.getByText('Ubicación de la ISS', { exact: true }).first().waitFor();
    await mpage.screenshot({ path: SCREENSHOTS_DIR + '/mobile-production.png', fullPage: true });
    const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 12, `Horizontal overflow ${overflow}px`);
    assert.deepEqual(errors, [], 'Uncaught JavaScript errors during mobile run');
    await mobile.close();
  });

  // Controlled visual checks: mock only ISS visibility, never misrepresent as live position.
  for (const visibility of ['daylight', 'eclipsed']) {
    await check(`synthetic ISS ${visibility} map theme`, async () => {
      assert.ok(liveISS, 'ISS API did not provide a valid fixture');
      const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      await ctx.route('**/api/iss-location', route => route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ...liveISS, visibility })
      }));
      await ctx.route(/google-analytics\.com|googletagmanager\.com|\/g\/collect/, route => route.abort('blockedbyclient'));
      const p = await ctx.newPage();
      await p.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await p.locator('.leaflet-container').waitFor({ timeout: 20000 });
      if (visibility === 'eclipsed') {
        await p.locator('.iss-map-tiles-night').waitFor({ timeout: 5000 });
      } else {
        assert.equal(await p.locator('.iss-map-tiles-night').count(), 0);
      }
      await p.screenshot({ path: SCREENSHOTS_DIR + '/map-' + visibility + '-synthetic.png', fullPage: false });
      await ctx.close();
    });
  }
  await context.close();
} catch (err) {
  report.push({ name: 'browser setup / execution', status: 'FAIL', detail: err.message });
  console.error('[FAIL] browser setup / execution', err);
} finally {
  if (browser) await browser.close();
}

console.log('Post-release smoke summary:', JSON.stringify(report, null, 2));
const failed = report.filter(item => item.status === 'FAIL');
if (failed.length) {
  console.error(`FAIL: ${failed.length} check(s). Production was not modified.`);
  process.exitCode = 1;
} else {
  console.log('PASS: all required checks. Warnings are reported separately.');
}
