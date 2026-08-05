# Offline Bible PWA

## Architecture constraints

- Keep the app framework-free: vanilla TypeScript, Vite, and hash routing are deliberate choices.
- `public/data/{book}/{chapter}.json` is the runtime data contract. Preserve its per-chapter shape.
- Keep source text fetches out of tests. Parser tests must use small, network-free fixtures.
- Bump `DATA_VERSION` in `src/sw/service-worker.ts` whenever a data-schema change requires clients to evict cached chapter data.

## ETL data flow

```text
scripts/raw/
  zh_cus/*.json       -> 02-parse-cuv.ts -> scripts/parsed/zh.json
  en_net.json         -> 03-parse-net.ts -> scripts/parsed/en.json
  opengnt.tsv         -> 04-parse-gnt.ts -> scripts/parsed/gr.json
  wlc.xml             -> 05-parse-wlc.ts -> scripts/parsed/he.json
scripts/parsed/*.json -> 06-merge.ts     -> public/data/{book}/{chapter}.json
scripts/lib/books.ts  -> 07-index.ts     -> public/data/index.json
```

`01d-fetch-fbc.ts` fetches FreeBibleCommentary chapter text into `scripts/raw/fbc/`; `06-merge.ts` associates it with chapter and verse output.

## Before commit

Run all required checks from the repository root:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Do not commit generated `scripts/raw/` source dumps, build output, or machine-local files.
