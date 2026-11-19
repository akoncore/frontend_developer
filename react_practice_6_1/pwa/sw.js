/* Build replaces these placeholders. This file is intentionally plain JS. */
const VERSION = __BUILD_VERSION__;
const PRECACHE = __PRECACHE_URLS__;
const SHELL = `folio-shell-${VERSION}`;
// Runtime data survives application updates; bump schema only if its format changes.
const DATA = 'folio-public-v1';
const STATIC = 'folio-static-v1';
const DAY = 24 * 60 * 60 * 1000;
const LIMITS = {
  [DATA]: { count: 60, age: 7 * DAY },
  [STATIC]: { count: 80, age: 30 * DAY },
};
const shellURLs = new Set(
  PRECACHE.map((path) => new URL(path, self.location.origin).href),
);
const knownPage = (path) =>
  /^(\/(posts(\/[^/]+)?|community(\/\d+)?|dashboard|about|login|signup|signin|profile|signout|offline)?\/?$)/.test(
    path,
  );

// 1. A failed download rejects installation: an incomplete version never takes over.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) =>
        cache.addAll(
          PRECACHE.map((url) => new Request(url, { cache: 'reload' })),
        ),
      ),
  );
  // No skipWaiting here: existing tabs must explicitly accept the update.
});

// 2. Activation happens on first installation, or after the Update button.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, DATA, STATIC]);
      await Promise.all(
        (await caches.keys())
          .filter(
            (name) =>
              /^folio-(shell|public|static)-/.test(name) && !keep.has(name),
          )
          .map((name) => caches.delete(name)),
      );
      await Promise.all([prune(DATA), prune(STATIC)]);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});

async function prune(name) {
  const cache = await caches.open(name);
  const { count, age } = LIMITS[name];
  for (const key of await cache.keys()) {
    const response = await cache.match(key);
    const savedAt = Number(response?.headers.get('X-Folio-Saved-At') || 0);
    if (Date.now() - savedAt > age) await cache.delete(key);
  }
  const keys = await cache.keys();
  await Promise.all(
    keys
      .slice(0, Math.max(0, keys.length - count))
      .map((key) => cache.delete(key)),
  );
}
async function cached(name, request) {
  const cache = await caches.open(name);
  const response = await cache.match(request);
  if (!response) return null;
  if (
    Date.now() - Number(response.headers.get('X-Folio-Saved-At')) >
    LIMITS[name].age
  ) {
    await cache.delete(request);
    return null;
  }
  return response;
}
async function stamp(response, source, savedAt = String(Date.now())) {
  const headers = new Headers(response.headers);
  headers.set('X-Folio-Source', source);
  headers.set('X-Folio-Saved-At', savedAt);
  // The body is already decoded by fetch; do not carry its transfer encoding.
  headers.delete('content-encoding');
  headers.delete('content-length');
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
// Serialize writes so concurrent requests cannot exceed the entry limit.
let writes = Promise.resolve();
function remember(name, request, response) {
  const copy = response.clone();
  writes = writes
    .catch(() => {})
    .then(async () => {
      if (
        !copy.ok ||
        copy.type === 'opaque' ||
        /private|no-store/i.test(copy.headers.get('cache-control') || '')
      )
        return;
      const cache = await caches.open(name);
      const value = await stamp(copy, 'cache');
      await cache.delete(request);
      await cache.put(request, value);
      await prune(name);
    });
  // A full disk must not turn a successful network response into an error.
  return writes.catch(() => {});
}
async function fetchWithTimeout(request, milliseconds = 4000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), milliseconds);
  try {
    return await fetch(request, {
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timeout);
  }
}
async function networkFirst(request, event) {
  let failedResponse;
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok) {
      event.waitUntil(remember(DATA, request, response));
      return stamp(response, 'network');
    }
    // Never turn an authorization failure or a genuine 404 into stale success.
    if (response.status < 500) return response;
    failedResponse = response;
  } catch {
    /* Network unavailable or timeout: try saved public data. */
  }
  const saved = await cached(DATA, request);
  if (saved) return saved;
  if (failedResponse) return failedResponse;
  return new Response(
    JSON.stringify({
      message: 'This data is not saved on this device. Connect and try again.',
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'X-Folio-Offline': '1' },
    },
  );
}
async function cacheFirst(request, event) {
  const saved = await cached(STATIC, request);
  if (saved) return saved;
  try {
    // Google fonts/images are public. Readable CORS responses can be timestamped.
    const response = await fetch(request.url, {
      mode: 'cors',
      credentials: 'omit',
    });
    event.waitUntil(remember(STATIC, request, response));
    return response;
  } catch {
    if (request.destination === 'image')
      return (await caches.open(SHELL)).match('/icons/offline-image.svg');
    return Response.error();
  }
}
async function navigation(request) {
  const url = new URL(request.url);
  const shell = await caches.open(SHELL);
  // Serve the HTML belonging to the active worker, not a mixed old/new build.
  if (knownPage(url.pathname)) {
    const page = await shell.match('/index.html');
    if (page) return page;
  }
  try {
    return await fetchWithTimeout(request);
  } catch {
    return (await shell.match('/offline.html')) || Response.error();
  }
}

// 3. Only explicitly allowed PUBLIC GETs enter shared runtime caches.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.headers.has('Authorization')) return;
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(navigation(request));
    return;
  }
  if (shellURLs.has(url.href)) {
    event.respondWith(
      caches
        .open(SHELL)
        // Immutable public build assets do not vary by request Origin.
        .then(
          async (cache) =>
            (await cache.match(request, { ignoreVary: true })) ||
            fetch(request),
        ),
    );
    return;
  }
  const publicData =
    (url.origin === self.location.origin &&
      url.pathname === '/data/posts.json' &&
      !url.search) ||
    (url.origin === 'https://jsonplaceholder.typicode.com' &&
      /^\/posts(\/\d+)?$/.test(url.pathname) &&
      !url.search);
  if (publicData && request.credentials === 'omit') {
    event.respondWith(networkFirst(request, event));
    return;
  }
  const publicAsset =
    (url.origin === self.location.origin &&
      /^\/(assets|icons)\//.test(url.pathname)) ||
    [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://images.unsplash.com',
    ].includes(url.origin);
  if (publicAsset && ['image', 'font', 'style'].includes(request.destination)) {
    event.respondWith(cacheFirst(request, event));
  }
  // Firebase, tokens, profile data and POST/PATCH/DELETE go straight to the network.
});
