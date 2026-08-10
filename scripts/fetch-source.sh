#!/usr/bin/env bash
# Re-fetch the three live GHL pages that the control templates reproduce.
# The distilled source of truth lives in source/<page>/ and IS committed.
# Raw HTML lands in source/_raw/ and is NOT committed (large, regenerable).
#
# Usage: ./scripts/fetch-source.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAW="$ROOT/source/_raw"
mkdir -p "$RAW"

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

fetch() {
  local name="$1" url="$2"
  local code
  code=$(curl -sL -o "$RAW/$name.html" -w '%{http_code}' -A "$UA" --max-time 60 "$url")
  printf '%-10s HTTP=%s  bytes=%s  %s\n' "$name" "$code" "$(wc -c < "$RAW/$name.html" | tr -d ' ')" "$url"
  [ "$code" = "200" ] || { echo "FAILED: $name returned $code" >&2; exit 1; }
}

fetch removal  'https://texastreetopsllc.com/landing-page-352422'
fetch trimming 'https://jvaldeztreeservices.com/landing-page-997015'
fetch storm    'https://texastreetopsllc.com/storm'

echo
echo "Fetched $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Distill with: node scripts/distill-source.mjs"
