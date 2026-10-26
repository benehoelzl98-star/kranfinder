/* Kranfinder Service Worker – Version 3980f614e0
   Start immer aus dem Gerätespeicher (schnell, auch offline). Neue Versionen kommen über ein Update
   dieses Service Workers: Er lädt im Hintergrund alles neu, danach zeigt die App „Neue Version geladen“. */
const C='kranfinder-3980f614e0';
const PRE=['./','manifest.webmanifest',"icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png","icons/favicon-64.png"];
/* umgeleitete Antworten (z. B. /index.html → /) „sauber“ speichern – sonst wären sie für Seitenaufrufe unbrauchbar */
const clean=r=>r.redirected?r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})):Promise.resolve(r);
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>
  fetch(new Request(u,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error(u+' '+r.status);return clean(r)}).then(r=>c.put(u,r))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('kranfinder-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){
    /* nur die App selbst aus dem Speicher – andere Seiten (z. B. /admin zum Hochladen) immer vom Server */
    const sc=new URL(self.registration.scope).pathname;if(u.pathname!==sc&&u.pathname!==sc+'index.html')return;
    e.respondWith(caches.open(C).then(c=>c.match('./').then(m=>m||fetch(r).then(res=>{if(res.ok&&!res.redirected)c.put('./',res.clone());return res}))).catch(()=>fetch(r)));
    return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok&&!res.redirected){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})));
});
