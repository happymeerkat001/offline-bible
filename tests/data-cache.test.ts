import { describe, expect, it } from 'vitest';
import { staleDataCacheNames } from '../src/sw/data-cache';

describe('service-worker data cache versioning', () => {
  it('evicts only stale Bible data caches', () => {
    expect(
      staleDataCacheNames(
        [
          'bible-data-v0.9.0',
          'bible-data-v1.0.0',
          'workbox-precache-v2',
          'bible-data-v1.1.0',
        ],
        'bible-data-v1.0.0'
      )
    ).toEqual(['bible-data-v0.9.0', 'bible-data-v1.1.0']);
  });
});
