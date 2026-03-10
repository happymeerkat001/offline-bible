/// <reference lib="webworker" />

// purpose: service worker stores cached assets and API responses in browser for offline access and faster load times, uses workbox to precache assets and define caching strategies for API data, manages cache versions and cleanup of old caches

import { clientsClaim } from 'workbox-core'; // import run clientsClaim from workbox-core to take control of uncontrolled clients as soon as the service worker becomes active
import { ExpirationPlugin } from 'workbox-expiration'; // import run ExpirationPlugin from workbox-expiration to automatically remove old entries from cache based on maxEntries limit
import { precacheAndRoute } from 'workbox-precaching'; // import run precacheAndRoute from workbox-precaching to precache assets and serve them with a cache-first strategy
import { registerRoute } from 'workbox-routing'; // import run registerRoute from workbox-routing to define custom caching strategies for specific routes
import { StaleWhileRevalidate } from 'workbox-strategies'; // import run StaleWhileRevalidate from workbox-strategies to serve cached response while fetching updated version in background for next time

declare const self: ServiceWorkerGlobalScope & { // declare self as ServiceWorkerGlobalScope with __WB_MANIFEST property injected by workbox during build time for precaching assets
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const DATA_VERSION = '1.0.0';  // define version for data cache to manage updates and invalidation of old cached data
const DATA_CACHE_PREFIX = 'bible-data-v'; // define prefix for data cache name to distinguish from other caches and allow for versioning with DATA_VERSION
const DATA_CACHE = `${DATA_CACHE_PREFIX}${DATA_VERSION}`; // define full cache name for data caching by combining prefix and version, used in caching strategies and cleanup logic

self.skipWaiting(); // control the service worker lifecycle by skipping the waiting phase and activating the new service worker immediately, allowing it to take control of clients and apply caching strategies without delay
clientsClaim(); // control uncontrolled clients as soon as service worker becomes active, allowing it to handle fetch events and apply caching strategies without requiring a page reload

precacheAndRoute(self.__WB_MANIFEST); // precache assets injected by workbox during build time and serve them with a cache-first strategy, ensuring app shell and static assets are available offline

registerRoute( 
  ({ url }) => url.pathname.startsWith('/data/'), // define custom caching strategy for API data routes by matching URL pathnames that start with /data/, allowing for efficient caching and offline access to Bible data 
  new StaleWhileRevalidate({
    cacheName: DATA_CACHE,
    plugins: [new ExpirationPlugin({ maxEntries: 1400 })]
  })
);

self.addEventListener('activate', (event: ExtendableEvent) => { 
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all( 
        keys
          .filter((key) => key.startsWith(DATA_CACHE_PREFIX) && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      );
    })()
  );
});
