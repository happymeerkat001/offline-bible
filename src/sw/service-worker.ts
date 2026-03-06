/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const DATA_VERSION = '1.0.0';
const DATA_CACHE_PREFIX = 'bible-data-v';
const DATA_CACHE = `${DATA_CACHE_PREFIX}${DATA_VERSION}`;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith('/data/'),
  new StaleWhileRevalidate({
    cacheName: DATA_CACHE,
    plugins: [new ExpirationPlugin({ maxEntries: 1400 })]
  })
);

self.addEventListener('activate', (event) => {
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
