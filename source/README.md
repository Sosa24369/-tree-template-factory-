# source/ — the locked source of truth (P0)

Everything the three "a" control templates must reproduce, captured from the live GHL pages
on 2026-08-08. **Do not edit these files to improve the copy.** They are the control.

| Page | Live URL | Client |
|---|---|---|
| `removal/`  | https://texastreetopsllc.com/landing-page-352422 | Texas Tree Tops |
| `trimming/` | https://jvaldeztreeservices.com/landing-page-997015 | J Valdez Tree Services |
| `storm/`    | https://texastreetopsllc.com/storm | Texas Tree Tops |

Each page folder contains:

- **`copy.md`** — every visible string in document order, byte-for-byte, wrapped in quotes so
  leading/trailing spaces are visible. Includes real U+00A0 non-breaking spaces. Source typos
  are preserved deliberately.
- **`structure.md`** — ordered section list, responsive-duplication map, and PHONE TREATMENT.
- **`images.json`** — one entry per logical image (responsive variants merged), including CSS
  background images. `width`/`height` are `null` wherever the source does not state them.
- **`form.json`** — full field schema including hidden fields, and submit behaviour.
- **`tracking.json`** — every third-party tag, plus GHL location/form/funnel ids.

Supporting folders:

- **`_raw/`** — the captured HTML (gitignored; regenerate with `scripts/fetch-source.sh`).
- **`_distilled/`** — machine-readable text/image/form/meta dumps used during extraction.

## Verify the capture

```
node scripts/verify-source-fidelity.mjs
```

Proves every quoted copy string in all three `copy.md` files exists verbatim in the captured
HTML. Currently: **575 strings checked, 0 missing.**

## Capture caveat

All three responses carry GHL's `_preview` asset paths and `is-preview="true"`. This is how
GHL renders on the public custom domain, not a sign the wrong URL was fetched (all three
returned HTTP 200 at their public addresses). It does mean form *runtime* behaviour was read
from static markup and configuration, not observed — re-confirm against a live submission at P4.
