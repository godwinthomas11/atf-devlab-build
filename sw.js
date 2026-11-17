// Keeps a copy of KasiBook on the phone so it opens with no internet.
const CACHE = "kasibook-v1";
const FILES = ["./", "index.html", "manifest.json", "icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Online: fetch the newest version and save it. Offline: use the saved copy.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(request, { cache: "no-cache" }) // skip the browser cache so a new version shows at once
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then((saved) => saved || caches.match("./")))
  );
});
