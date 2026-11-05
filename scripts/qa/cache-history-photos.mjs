import { readFileSync, existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const source = readFileSync('src/services/historicalAstronautData.ts', 'utf8');
const urls = [...source.matchAll(/image:\s*"(https:\/\/[^"]+)"/g)].map(m => m[1]);
if (urls.length !== 12) throw new Error('Expected 12 external milestone images, got ' + urls.length);
await mkdir('public/images/history', { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function download(original, number) {
  const mirrors = [
    original,
    'https://images.weserv.nl/?url=' + encodeURIComponent(original),
    'https://wsrv.nl/?url=' + encodeURIComponent(original)
  ];
  for (const url of mirrors) {
    for(let attempt=0; attempt<3; attempt++) {
      try {
        const res=await fetch(url,{
          signal: AbortSignal.timeout(20000),
          headers: { 'User-Agent': 'SpacePeopleCounter/1.0 historical educational archival images', 'Accept':'image/avif,image/webp,image/png,image/jpeg,image/*' }
        });
        if(!res.ok){console.log('SOURCE '+number+' HTTP '+res.status+' '+new URL(url).host);await sleep(1200*(attempt+1));continue;}
        const contentType=res.headers.get('content-type')||'';
        if(!contentType.startsWith('image/')){console.log('SOURCE '+number+' invalid content-type '+contentType);continue;}
        const bytes=Buffer.from(await res.arrayBuffer());
        if(bytes.length<2000 || bytes.length>12000000)throw new Error('Invalid image size '+bytes.length);
        const resized=await sharp(bytes, {limitInputPixels:40_000_000})
          .rotate()
          .resize({width:850,height:650,fit:'inside',withoutEnlargement:true})
          .webp({quality:80,effort:4})
          .toBuffer();
        if(resized.length<1000 || resized.length>450000)throw new Error('Unexpected optimized size '+resized.length);
        console.log('SOURCE '+number+' OK '+(bytes.length/1024).toFixed(0)+' KB -> '+(resized.length/1024).toFixed(0)+' KB from '+new URL(url).host);
        return resized;
      } catch(e) {
        console.log('SOURCE '+number+' ERROR '+(e?.cause?.code||e.message));
        await sleep(1000*(attempt+1));
      }
    }
  }
  throw new Error('Cannot retrieve milestone '+number+' from Wikimedia or archival mirror: '+original);
}

const buffers=[];
for(let i=0;i<urls.length;i++) {
  buffers.push(await download(urls[i],i+1));
  await sleep(1000);
}
// Atomic: don't commit a partially downloaded catalog.
for(let i=0;i<buffers.length;i++) {
  const target='public/images/history/'+String(i+1).padStart(2,'0')+'.webp';
  await writeFile(target,buffers[i]);
}
console.log('PASS: all 12 milestone photos saved locally, total '+(buffers.reduce((n,b)=>n+b.length,0)/1024).toFixed(0)+' KB');
