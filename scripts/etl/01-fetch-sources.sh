#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RAW_DIR="$ROOT/scripts/raw"
CUS_DIR="$RAW_DIR/zh_cus"
mkdir -p "$RAW_DIR"
mkdir -p "$CUS_DIR"

# Source URLs (pin to upstream snapshots/tags before production use).
CUS_BASE_URL="https://api.getbible.net/v2/cus"
OPENGNT_URL="https://raw.githubusercontent.com/Clear-Bible/macula-greek/main/Nestle1904/tsv/macula-greek-Nestle1904.tsv"
MORPHHB_BASE="https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc"
MORPHHB_BOOKS="Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal"

fetch_if_missing() {
  local url="$1"
  local out="$2"
  if [[ -f "$out" ]]; then
    echo "skip: $out"
    return 0
  fi
  echo "fetch: $url"
  curl -fsSL "$url" -o "$out"
}

for book in $(seq 1 66); do
  fetch_if_missing "$CUS_BASE_URL/${book}.json" "$CUS_DIR/${book}.json"
done

fetch_if_missing "$OPENGNT_URL" "$RAW_DIR/opengnt.tsv"

if [[ -f "$RAW_DIR/wlc.xml" ]]; then
  echo "skip: $RAW_DIR/wlc.xml"
else
  echo "fetch: morphhb WLC (39 books) -> $RAW_DIR/wlc.xml"
  > "$RAW_DIR/wlc.xml"
  for book in $MORPHHB_BOOKS; do
    curl -fsSL "$MORPHHB_BASE/${book}.xml" >> "$RAW_DIR/wlc.xml"
  done
fi

npm exec tsx "$ROOT/scripts/etl/01b-fetch-net.ts"
npm exec tsx "$ROOT/scripts/etl/01c-fetch-net-notes.ts"
npm exec tsx "$ROOT/scripts/etl/01d-fetch-fbc.ts"
