import { readFileSync } from 'node:fs';
const src = readFileSync('src/services/historicalAstronautData.ts', 'utf8');
const images = [...src.matchAll(/image:\s*"(https:\/\/[^"]+)"/g)].map(x => x[1]);
const names=['Gagarin','Shepard','Tereshkova','Leonov','Moon','Salyut','Skylab','Mir','Zarya','Expedition1','Tiangong','Axiom1'];
const status=async u=>{
 try{const r=await fetch(u,{headers:{'User-Agent':'SpacePeopleCounter-ImageAudit/1.0'},signal:AbortSignal.timeout(10000)});const t=r.status+' '+r.headers.get('content-type');await r.body?.cancel();return t}
 catch(e){return 'ERR '+(e.cause?.code||e.message)}
};
const direct=u=>u.replace('/commons/thumb/','/commons/').replace(/\/800px-[^/]+$/,'');
for(let i=0;i<images.length;i++){
 const a=images[i], b=direct(a);
 const [sa,sb]=await Promise.all([status(a),status(b)]);
 console.log((i+1)+'. '+names[i]+' thumbnail='+sa+' original='+sb+' '+b);
}
const queries=['Yuri Gagarin portrait 1961','Alan Shepard astronaut','Valentina Tereshkova','Alexei Leonov','Buzz salutes the U.S. Flag','Salyut 1 Soyuz','Skylab SL-4','Mir space station','ISS Zarya','Expedition 1 crew','Tiangong station','Axiom Mission 1 crew'];
for(let i=0;i<queries.length;i++){
 try{
  const api=new URL('https://commons.wikimedia.org/w/api.php');
  api.search=new URLSearchParams({action:'query',generator:'search',gsrsearch:queries[i],gsrnamespace:'6',gsrlimit:'3',prop:'imageinfo',iiprop:'url|extmetadata',format:'json'}).toString();
  const res=await fetch(api,{signal:AbortSignal.timeout(10000),headers:{'User-Agent':'SpacePeopleCounter-ImageAudit/1.0'}});
  if(!res.ok){console.log('Commons API '+names[i]+': '+res.status);continue}
  const data=await res.json();
  const output=Object.values(data.query?.pages||{}).map(p=>({title:p.title,url:p.imageinfo?.[0]?.url,license:p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value}));
  console.log('Candidates '+names[i]+' '+JSON.stringify(output));
 }catch(e){console.log('Commons API ERR '+names[i]+' '+(e.cause?.code||e.message))}
}
