/*
 * Bay Ready's service worker: keeps a copy of the site so it opens without a
 * connection, which is when people may need it most.
 *
 * - Pages: network first, so people always get the newest version when online,
 *   with the saved copy as the fallback.
 * - Built files (/_next/static, icons, fonts): cache first. Their names change
 *   whenever their contents do, so a saved copy is never stale.
 * - On install it saves the home page, the list, the sign, and the sources
 *   page, plus every built file those pages use.
 *
 * Registered by src/components/ServiceWorker.tsx in production builds only.
 * It works under a sub-path (GitHub Pages) by reading its own scope. Bump
 * VERSION to throw away every saved copy on the next visit.
 */

const VERSION = "v1";
const CACHE = `bayready-${VERSION}`;
const scope = new URL(self.registration.scope);
// The Pages build ends page URLs in a slash; a plain `next build` doesn't.
const slash = new URL(self.location.href).searchParams.get("slash") === "1";
const page = (path) => new URL(path && slash ? `${path}/` : path, scope).href;
const SHELL = [page(""), page("list"), page("sign"), page("about")];

const isStatic = (url) =>
  url.pathname.includes("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname);

/** Saves every built file a page refers to, so the page works offline right away. */
async function saveAssets(cache, html) {
  const found = new Set();
  for (const m of html.matchAll(/_next\/static\/[^"'\s\\)<>]+/g)) found.add(new URL(scope.pathname + m[0], scope).href);
  await Promise.allSettled(
    [...found].map(async (url) => {
      if (!(await cache.match(url))) await cache.add(url);
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.allSettled(
        SHELL.map(async (url) => {
          const res = await fetch(url, { cache: "no-cache" });
          if (!res.ok || res.redirected) return;
          await cache.put(url, res.clone());
          await saveAssets(cache, await res.text());
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key.startsWith("bayready-") && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

const OFFLINE_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline – Bay Ready</title></head>
<body style="font-family:system-ui,sans-serif;background:#e9eef0;color:#13293d;margin:0;padding:2rem 1rem;line-height:1.5">
<main style="max-width:36rem;margin:0 auto"><h1 style="font-size:1.6rem">You're offline</h1>
<p>This page wasn't saved on this device yet. Your list should still open.</p>
<p><a href="${page("list")}" style="color:#13293d;font-weight:600">Open my list</a></p></main></body></html>`;

/** The saved copy of a page is keyed without its query string. */
const pageKey = (url) => {
  const u = new URL(url);
  return u.origin + u.pathname;
};

async function networkFirst(request, isPage) {
  const cache = await caches.open(CACHE);
  const key = isPage ? pageKey(request.url) : request;
  try {
    const res = await fetch(request);
    if (res.ok && res.type === "basic" && !res.redirected) await cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) return hit;
    if (isPage) return new Response(OFFLINE_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type === "basic") await cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.endsWith("/sw.js")) return;
  if (request.mode === "navigate") event.respondWith(networkFirst(request, true));
  else if (isStatic(url)) event.respondWith(cacheFirst(request));
  else event.respondWith(networkFirst(request, false));
});
