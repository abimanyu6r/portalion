const CACHE_NAME = "portal-upa-cache-v7";

const urlsToCache = [
  "./",
  "index.html",
  "manifest.json",
  "foto/Landing%20Page.png",
  "foto/Open%20source-rafiki%201.png",
  "foto/upa-pkk-logo%201.png",
  "foto/upa-pkk-logo%20512.png",
  "foto/screenshot_desktop.jpeg",
  "foto/screenshot_mobile.jpeg",
  "fonts/fonts.css",
  "fonts/Koulen-Regular.ttf",
  "fonts/BebasNeue-Regular.ttf",
  "fonts/Roboto-Regular.ttf",
  "fonts/Roboto-Bold.ttf",
];

// Perform install
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error("Cache addAll failed:", err);
      })
  );
});

// Fetch resources
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Optional: dynamically cache other requests
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        }).catch(() => {
          // If fetch fails (offline) and no cache match, return a fallback if needed
          // For now, we just let it fail or return nothing
        });
      })
  );
});

// Activate the SW and clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    clients.claim()
  );
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
