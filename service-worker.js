
const CACHE_NAME = "agridirect-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./login.html",
    "./register.html",
    "./css/style.css",
    "./js/auth.js",
    "./js/script.js",
    "./manifest.json"
];

// Install service worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

// Load cached files when offline
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse ||
                fetch(event.request).then(response => {
                    if (response.ok) {
                        const responseCopy = response.clone();

                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseCopy);
                        });
                    }

                    return response;
                });
        })
    );
});
