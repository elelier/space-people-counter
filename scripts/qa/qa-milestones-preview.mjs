import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const BASE_URL = process.env.PREVIEW_URL;
if (!BASE_URL) throw new Error('PREVIEW_URL is required');
await mkdir('qa-artifacts/history', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const names = [
  'Primer ser humano en el espacio',
  'Primer estadounidense en el espacio',
  'Primera mujer en el espacio',
  'Primera caminata espacial',
  'Primeros seres humanos en la Luna',
  'Primera estación espacial',
  'Primera estación espacial estadounidense',
  'Inicio de la estación espacial Mir',
  'Comienza la construcción de la EEI',
  'Ocupación continua de la EEI',
  'Inicio de la estación espacial china',
  'Primera misión privada de astronautas a la EEI'
];
const failures=[];
const results=[];
try {
  for (const width of [390, 1366]) {
    const ctx = await browser.newContext({ viewport: { width, height: 850 }, isMobile: width === 390, hasTouch: width === 390 });
    await ctx.route(/google-analytics\.com|googletagmanager\.com|\/g\/collect/, r => r.abort('blockedbyclient'));
    const page = await ctx.newPage();
    const pageErrors=[];
    page.on('pageerror', e => pageErrors.push(e.message));
    const res = await page.goto(BASE_URL, {waitUntil:'domcontentloaded', timeout:45000});
    assert.equal(res.status(),200);
    const section=page.locator('#historial');
    await expect(section.getByText('Presencia humana continua en el espacio')).toBeVisible();
    await expect(section.getByText('26', {exact:true}).first()).toBeVisible({timeout:10000});
    await expect(section.getByText(/desde el 2 de noviembre de 2000/)).toBeVisible();
    await section.getByRole('button', {name:'Hitos Espaciales'}).click();
    const modal=page.locator('div.fixed.inset-0.z-50');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Hito 1 de 12')).toBeVisible();
    const items=width===390?[0,6,11]:names.map((_,i)=>i);
    for(const i of items) {
      // Navigate using existing arrows, including wrapping on mobile.
      if(i===0 && (await modal.getByText('Hito 1 de 12').count())) {
        // Already at start.
      } else if(width===390) {
        for(let j=0;j<(i-(items[items.indexOf(i)-1]??0));j++) await modal.locator('button:has(svg.lucide-chevron-right)').click();
      } else if(i>0) {
        await modal.locator('button:has(svg.lucide-chevron-right)').click();
      }
      await expect(modal.getByRole('heading', {name:names[i], exact:true})).toBeVisible();
      await expect(modal.getByText('Hito '+(i+1)+' de 12')).toBeVisible();
      await expect(modal.getByRole('link', {name:/Fuente y licencia/})).toBeVisible();
      const img=modal.locator('img[alt="'+names[i]+'"]');
      await page.waitForFunction(({alt}) => {
        const image = document.querySelector('img[alt="'+alt+'"]');
        const fallback = document.querySelector('[aria-label="Fotografía no disponible: '+alt+'"]');
        return (image && image.complete && image.naturalWidth > 0) || Boolean(fallback);
      }, {alt:names[i]}, {timeout:18000});
      const loaded=await page.evaluate(alt => {
        const image=document.querySelector('img[alt="'+alt+'"]');
        return Boolean(image?.complete && image.naturalWidth > 0);
      }, names[i]);
      const fallback=await modal.getByText('Fotografía no disponible', {exact:true}).isVisible().catch(()=>false);
      console.log((loaded?'[PHOTO OK]':'[PHOTO FALLBACK]')+' '+(i+1)+' '+names[i]+' mobile='+String(width===390));
      if(!loaded && !fallback) failures.push('Image neither loaded nor fallback: '+names[i]);
      if(!loaded) results.push('Image unavailable via Wikimedia at runtime: '+names[i]);
      if((i===0 || i===6 || i===11)) {
        await modal.screenshot({path:'qa-artifacts/history/'+width+'px-milestone-'+(i+1)+'.png'});
      }
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow<=12,'Horizontal overflow '+overflow+' at '+width+'px');
    assert.deepEqual(pageErrors,[]);
    await modal.getByRole('button',{name:'Cerrar modal'}).click();
    console.log('[PASS] '+width+'px titles/description, photo handling, timeline, duration, overflow');
    await ctx.close();
  }
  // Forced network failure must show a deliberate, accessible placeholder.
  const blocked=await browser.newContext({viewport:{width:390,height:850}});
  await blocked.route('**/upload.wikimedia.org/**', r=>r.abort('failed'));
  await blocked.route(/google-analytics\.com|googletagmanager\.com|\/g\/collect/,r=>r.abort('blockedbyclient'));
  const p=await blocked.newPage();
  await p.goto(BASE_URL,{waitUntil:'domcontentloaded',timeout:45000});
  await p.locator('#historial').getByRole('button',{name:'Hitos Espaciales'}).click();
  await expect(p.getByText('Fotografía no disponible',{exact:true})).toBeVisible({timeout:15000});
  await p.locator('div.fixed.inset-0.z-50').screenshot({path:'qa-artifacts/history/mobile-forced-image-failure.png'});
  console.log('[PASS] Forced image error uses accessible fallback');
  await blocked.close();
} finally {
  await browser.close();
}
console.log('External image observations:',JSON.stringify(results));
if(failures.length){console.error('[FAIL]',JSON.stringify(failures));process.exitCode=1}
else console.log('PASS: browser functional checks; external image observations above');
