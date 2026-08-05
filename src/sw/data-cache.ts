export const DATA_CACHE_PREFIX = 'bible-data-v';

export function staleDataCacheNames(
  cacheNames: string[],
  currentCacheName: string
): string[] {
  return cacheNames.filter(
    (cacheName) =>
      cacheName.startsWith(DATA_CACHE_PREFIX) && cacheName !== currentCacheName
  );
}
