// Morfeas — service worker
// Bump CACHE whenever anything in APP_SHELL changes, to force an update.
const CACHE = "anesthesia-v476";

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
  "./icons/favicon-32-v2.png",
  "./icons/apple-touch-icon-v2.png",
  "./icons/icon-192-v2.png",
  "./icons/icon-512-v2.png",
  "./icons/icon-maskable-192-v2.png",
  "./icons/icon-maskable-512-v2.png",
  "./icons/qr-morfeas.png",
  "./fonts/commissioner.woff",
  "./audio/metro-100.m4a",
  "./audio/metro-110.m4a",
  "./audio/metro-120.m4a",
];

// React from the CDN. These URLs carry a fixed version, so their content never
// changes: a copy kept by an older version of the app is just as good.
const REMOTE = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
];

// Cross-origin CDN responses often carry a Vary header. Without ignoreVary a
// later lookup can miss its own cached copy and the app breaks offline.
const MATCH = { ignoreVary: true };

// cache.add() uses a normal fetch, which may be served from the browser's own
// HTTP cache. Bumping CACHE would then install stale scripts and the update
// would never reach the user. "reload" forces a trip to the network.
function fresh(u) {
  return new Request(u, { cache: "reload" });
}

async function addWithRetry(cache, req, tries) {
  for (let i = 0; i < (tries || 3); i++) {
    try { await cache.add(req); return true; } catch (e) { /* try again */ }
  }
  return false;
}

async function fromOlderCaches(u) {
  for (const k of await caches.keys()) {
    if (k === CACHE) continue;
    const hit = await (await caches.open(k)).match(u, MATCH);
    if (hit) return hit;
  }
  return null;
}

async function fillCache() {
  const hadOlder = (await caches.keys()).some((k) => k !== CACHE && k.startsWith("anesthesia-"));
  const cache = await caches.open(CACHE);
  const ok = await Promise.all(APP_SHELL.map((u) => addWithRetry(cache, fresh(u))));
  // CDN: network first; if it fails (weak signal, blocked CDN), reuse the
  // identical file the previous version already holds.
  for (const u of REMOTE) {
    if (await addWithRetry(cache, u)) continue;
    const old = await fromOlderCaches(u);
    if (old) await cache.put(u, old);
  }
  // An update must never replace a complete older copy with an incomplete one:
  // failing the install keeps the previous version working offline, and the
  // browser tries the update again later. A first install is allowed through,
  // and the gaps are filled in activate and on the next online use.
  if (hadOlder && ok.includes(false)) throw new Error("Morfeas: incomplete download, keeping the previous version");
}

self.addEventListener("install", (event) => {
  event.waitUntil(fillCache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Re-try anything that failed at install (a flaky first load used to leave
    // the app permanently broken offline).
    for (const u of APP_SHELL.concat(REMOTE)) {
      if (await cache.match(u, MATCH)) continue;
      if (await addWithRetry(cache, u.startsWith("http") ? u : fresh(u))) continue;
      const old = await fromOlderCaches(u);
      if (old) await cache.put(u, old);
    }
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// The app's own address: <scope> and <scope>index.html (any ?query).
function isAppPage(url) {
  const scope = new URL(self.registration.scope).pathname;
  const p = new URL(url).pathname;
  return p === scope || p === scope + "index.html";
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Opening the app: the stored copy, at once, without waiting for the
  // network. Network-first used to hang for a long time on a weak signal and,
  // on hospital Wi-Fi with a login page, showed that page instead of the app.
  // New versions still arrive: the browser checks sw.js, installs the new
  // CACHE, and the page shows the "new version" banner.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      if (isAppPage(req.url)) {
        const shell = (await cache.match("./index.html", MATCH)) || (await cache.match("./", MATCH));
        if (shell) return shell;
      }
      try {
        return await fetch(req);
      } catch (e) {
        return (await cache.match(req, MATCH))
            || (await cache.match("./index.html", MATCH))
            || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }

  // Everything else: this version's cache first, then network, caching what comes back. Updates arrive
  // through a new CACHE name (all files replaced together), never file by file, so versions cannot mix.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, MATCH);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      // Only complete, readable responses are cached: an opaque response may hide an error page, and the
      // CDN scripts are requested with CORS (crossorigin + integrity), so they are never opaque.
      if (res && res.ok && res.type !== "opaque") {
        const clone = res.clone();
        cache.put(req, clone);
      }
      return res;
    } catch (e) {
      // Last resort: a copy stored under the plain URL string, here or in an older cache.
      const alt = (await cache.match(req.url, MATCH)) || (await fromOlderCaches(req.url));
      if (alt) return alt;
      throw e;
    }
  })());
});
