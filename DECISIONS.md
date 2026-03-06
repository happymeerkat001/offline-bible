# Offline Bible PWA Decisions

## 1) Translation sources
- Chinese: `thiagobodruk/bible` (`zh_cuv`) public domain JSON.
- English: `thiagobodruk/bible` (`en_net`) JSON.
- Greek NT: Nestle 1904 via OpenGNT TSV (public domain).
- Hebrew OT: Westminster Leningrad Codex via `openscriptures/morphhb` OSIS XML (public domain).

## 2) English translation: NET Bible
- Source: thiagobodruk/bible en_net.json (public domain JSON)
- License: NET Bible free for non-commercial use, redistributable
- No API key required
- Repo can be public
- Full NET footnotes will be added as a fifth data track in a future ETL step via labs.bible.org/api

## 3) Data shape and cache invalidation
- Canonical output is per-chapter JSON at `public/data/{book}/{chapter}.json`.
- OT chapters include `he`; NT chapters include `gr`.
- `public/data/index.json` includes semantic data version (`v`) used by service worker eviction.

## 4) Offline strategy
- Tier 1: Workbox precache for hashed app-shell assets.
- Tier 2: runtime `StaleWhileRevalidate` cache for `/data/**`.
- SW activation compares embedded `DATA_VERSION` with `/data/index.json` and evicts stale `bible-data-v*` caches.

## 5) Routing
- Hash routing (`/#/USFM/CH`) to avoid GitHub Pages server rewrite requirements.

## 6) Rendering requirements
- Hebrew: `dir="rtl"`, line-height >= 2.0 to prevent nikud/trop clipping.
- Greek polytonic: line-height >= 1.8 with Gentium Plus subset.
- Chinese: system CJK stack, no mandatory webfont.
