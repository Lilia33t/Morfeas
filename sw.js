// Morfeas — service worker
// Bump CACHE whenever anything in APP_SHELL changes, to force an update.
const CACHE = "anesthesia-v77";

// React is loaded from vendor/ when present (fully offline) and from the CDN
// otherwise. Both are listed so whichever one the page actually uses is cached.
const APP_SHELL = [
  "./",
  "./index.html",
  "./src/data.js",
  "./src/formulas.js",
  "./src/primitives.js",
  "./src/tabs.js",
  "./src/root.js",
  "./manifest.webmanifest",
  "./LICENSE",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./vendor/react.production.min.js",
  "./vendor/react-dom.production.min.js",
];

// Remote assets are best-effort: they must never block install.
const REMOTE = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
  "https://fonts.googleapis.com/css2?family=Commissioner:wght@400;600;700;800&display=swap&subset=greek,latin",
];

// Cross-origin CDN responses often carry a Vary header. Without ignoreVary a
// later lookup can miss its own cached copy and the app breaks offline — this
// was the actual offline failure.
const MATCH = { ignoreVary: true };

async function fillCache() {
  const cache = await caches.open(CACHE);
  await Promise.allSettled(APP_SHELL.map((u) => cache.add(u)));
  await Promise.allSettled(REMOTE.map((u) => cache.add(u)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(fillCache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    // Re-try anything that failed at install (a flaky first load used to leave
    // the app permanently broken offline).
    const cache = await caches.open(CACHE);
    const missing = [];
    for (const u of APP_SHELL.concat(REMOTE)) {
      if (!(await cache.match(u, MATCH))) missing.push(u);
    }
    await Promise.allSettled(missing.map((u) => cache.add(u)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Navigations: try the network, fall back to the cached shell.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch (e) {
        return (await caches.match("./index.html", MATCH))
            || (await caches.match("./", MATCH))
            || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }

  // Everything else: cache-first, then network, caching what comes back.
  event.respondWith((async () => {
    const cached = await caches.match(req, MATCH);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && (res.status === 200 || res.type === "opaque")) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    } catch (e) {
      // Last resort for scripts: a same-named local/vendor copy if one exists.
      const alt = await caches.match(req.url, MATCH);
      if (alt) return alt;
      throw e;
    }
  })());
});
