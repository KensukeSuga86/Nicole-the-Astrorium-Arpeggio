/* Nicole the Astrorium — GitHub Pages PWA service worker */
const CACHE = 'nicole-astrorium-v1.1.0-pages-16-guide-geosearch';
const CORE = [
  './','./index.html','./presenter.html','./projector.html','./ipad.html',
  './manifest.webmanifest','./ipad.webmanifest','./icon-192.png','./icon-512.png','./quick-manual.html','./QUICK-MANUAL.md',
  './art-image-store.js','./media-library.js','./location-favorites.js','./db-bridge.js',
  './database/db-bundle.js','./assets/art-data.js','./places-offline.js','./pwa-register.js',
  './ipad-app.js','./bootstrap-ipad.js','./assets/hip_constellation_line_star.csv',
  './database-bootstrap.js','./bootstrap-presenter.js','./bootstrap-projector.js',
  './presenter-app.js','./projector-app.js','./engine.js','./renderer-adapter.js',
  './scene-state.js','./data-fallback.js','./constellation-art.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k.startsWith('nicole-astrorium-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Check for a fresh app shell when online, but keep the installed PWA usable offline.
// Cache-first for executable JS kept old UI indefinitely on previously installed iPads.
const FRESH_FILES=new Set([
 'index.html','ipad.html','presenter.html','projector.html',
 'ipad-app.js','engine.js','renderer-adapter.js','db-bridge.js',
 'database-bootstrap.js','bootstrap-ipad.js',
 'manifest.webmanifest','ipad.webmanifest',
 'hip_constellation_line_star.csv'
]);
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const file=url.pathname.split('/').pop()||'index.html';
  const fresh=FRESH_FILES.has(file);
  if(fresh){
   try{
    const response=await fetch(event.request,{cache:'no-cache'});
    if(response?.ok){await cache.put(event.request,response.clone());return response}
   }catch(error){console.warn('Offline app shell',file,error)}
   const saved=await cache.match(event.request);
   if(saved)return saved;
   return Response.error();
  }
  const saved=await cache.match(event.request);
  if(saved)return saved;
  try{
   const response=await fetch(event.request);
   if(response?.ok)await cache.put(event.request,response.clone());
   return response;
  }catch(error){return (event.request.mode==='navigate'&&await cache.match('./index.html'))||Response.error()}
 })());
});
