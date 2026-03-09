const CACHE_NAME = "cert-system-cache-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./create.html",
    "./view.html",
    "./reprint.html",
    "./style.css",
    "./main.js",
    "./create.js",
    "./view.js",
    "./reprint.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
