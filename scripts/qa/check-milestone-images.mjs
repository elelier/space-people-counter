const titles = [
  'File:Salyut 1 and Soyuz drawing.png',
  'File:Chinese Tiangong Space Station.jpg',
  'File:Axiom Crew Portrait.jpg',
  'File:Yuri Gagarin (1961) - Restoration.jpg'
];
const api=new URL('https://commons.wikimedia.org/w/api.php');
api.search=new URLSearchParams({action:'query',titles:titles.join('|'),prop:'imageinfo',iiprop:'url|extmetadata',format:'json'}).toString();
try{
 const r=await fetch(api,{headers:{'User-Agent':'SpacePeopleCounterImageAudit/1.0'},signal:AbortSignal.timeout(15000)});
 console.log('Commons API:',r.status);if(!r.ok)process.exit(1);
 const data=await r.json();
 for(const x of Object.values(data.query?.pages||{})){
  const a=x.imageinfo?.[0], m=a?.extmetadata;
  console.log(JSON.stringify({title:x.title,url:a?.url,license:m?.LicenseShortName?.value,artist:m?.Artist?.value?.replace(/<[^>]+>/g,''),credit:m?.Credit?.value?.replace(/<[^>]+>/g,'').slice(0,100)}));
 }
}catch(e){console.error('FAIL',e);process.exit(1)}
