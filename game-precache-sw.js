const CACHE_NAME = 'sonic-boom-unity-v1';
const UNITY_FILES = [
  { path: 'game/Build/Downloads.loader.js', size: 26416 },
  { path: 'game/Build/Downloads.framework.js', size: 444202 },
  { path: 'game/Build/Downloads.data', size: 36751119 },
  { path: 'game/Build/Downloads.wasm', size: 44084677 },
];
const TOTAL_BYTES = UNITY_FILES.reduce((total, file) => total + file.size, 0);

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('sonic-boom-unity-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.headers.has('range') || !url.pathname.includes('/game/Build/')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'preload-unity') return;

  const client = event.source;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let completedBytes = 0;
    let completedFiles = 0;
    const report = (downloadedBytes, status) => {
      client?.postMessage({
        type: 'unity-preload-progress',
        progress: Math.min(100, Math.round(downloadedBytes / TOTAL_BYTES * 100)),
        status,
      });
    };

    try {
      for (const file of UNITY_FILES) {
        const url = new URL(file.path, self.registration.scope).href;
        const request = new Request(url, { cache: 'reload' });
        const cached = await cache.match(request);
        if (cached) {
          completedBytes += file.size;
          completedFiles += 1;
          report(completedBytes, `Cached ${completedFiles} of ${UNITY_FILES.length} simulator files...`);
          continue;
        }

        report(completedBytes, 'Preparing flight simulator files...');
        const response = await fetch(request);
        if (!response.ok) throw new Error(`Could not preload ${file.path}`);

        const cacheWrite = cache.put(request, response.clone());
        if (response.body) {
          const reader = response.body.getReader();
          let loadedBytes = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            loadedBytes += value.byteLength;
            report(completedBytes + Math.min(file.size, loadedBytes), 'Preparing flight simulator files...');
          }
        } else {
          await response.arrayBuffer();
        }
        await cacheWrite;
        completedBytes += file.size;
        completedFiles += 1;
        report(completedBytes, `Cached ${completedFiles} of ${UNITY_FILES.length} simulator files...`);
      }
      report(TOTAL_BYTES, 'Flight simulator is ready to open.');
    } catch {
      report(completedBytes, 'Preload paused. Remaining files will load when Mission 8 opens.');
    }
  })());
});