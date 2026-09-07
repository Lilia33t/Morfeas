// Morfeas — service worker
// Bump CACHE version whenever app.js / index.html change to force an update.
const CACHE = "anesthesia-v71";

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
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
  "https://fonts.googleapis.com/css2?family=Commissioner:wght@400;600;700;800&display=swap&subset=greek,latin",
];

// Install: pre-cache the shell. Don't fail install if a remote asset is briefly unavailable.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

// Activate: drop old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//  - Navigations: network-first, fall back to cached index.html (offline SPA shell).
//  - Everything else: cache-first, then network (and cache the result).
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Cache successful same-origin & CDN font/script responses for future offline use.
        if (res && (res.status === 200 || res.type === "opaque")) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
