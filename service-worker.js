/* 2026 서울국제도서전 맵 — Service Worker (cache-first)
   HTML을 수정해 배포할 때는 아래 CACHE_NAME 버전만 올리면
   activate 단계에서 구버전 캐시가 정리되고 새 파일이 캐싱됩니다. */
const CACHE_NAME = 'sibf-map-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

/* install: 핵심 자산 전부 미리 캐싱 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* activate: 구버전 캐시 삭제 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* fetch: 캐시 우선, 없으면 네트워크 (성공 시 캐시에 보관) */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
