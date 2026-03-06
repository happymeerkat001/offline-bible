# Offline Bible PWA

Static offline-first Bible web app with Chinese (CUV), English (ESV via local ETL cache), Greek NT, and Hebrew OT.

## Status
- Phase 1 (Durable) baseline scaffold is in place.
- ETL scripts are included and executable, but you still need to run full source ingestion and verify edge cases before production data commit.

## Local setup
1. `cd apps/offline-bible`
2. `npm install`
3. `cp scripts/.env.example scripts/.env` and set `ESV_API_KEY`
4. `npm run data:build`
5. `npm run dev`

## Build
- `npm run build`
- `npm run preview`

## Data output
- Chapter files: `public/data/{book}/{chapter}.json`
- Book index: `public/data/index.json`

## Licensing note
- ESV text is personal-use cached data. Keep repository and deployment private when full ESV content is present.

## Commit spine
- Durable -> Deliver -> Control -> Mutation -> Sustain.
- See `DECISIONS.md` for permanent constraints.
