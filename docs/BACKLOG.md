# Backlog — unresolved items

Items deliberately not built, with the reason. Reviewed at each phase boundary.

---

## Facebook photo import — UNRESOLVED, out of scope

**Status:** not built, and no workaround attempted, per explicit instruction in the build brief.

**What was asked for originally:** pull a client's job photos directly from their Facebook business page so onboarding a new client does not require them to send an image set.

**Why it is not built:**
- Facebook actively blocks automated scraping (rate limiting, bot detection, markup that changes specifically to break scrapers). Anything built against it would break without warning.
- It is a terms-of-service violation, which makes it a legal exposure and not only a technical one.
- The official route (Facebook Graph API, `/{page-id}/photos`) needs a reviewed Meta app plus a Page access token granted by each client — that is an onboarding burden roughly equal to just asking the client for the photos.

**Consequence for the product:** per-client photo sets are supplied manually, or picked up by the P5 website auto-fill from the client's own website (which is fair game and not blocked).

**If this is revisited**, the only defensible path is the official Graph API with per-client granted tokens. Do not build a scraper.

---

## No auth on the dashboard (v1 known gap)

**Status:** accepted for v1, recorded here so it is not forgotten.

The dashboard is a local admin interface with no authentication. That is fine while it runs on localhost only. It becomes a real vulnerability the moment it is deployed anywhere reachable, because it exposes every client's GHL location id, GTM container, and CallRail configuration.

**Rule until this is resolved:** the dashboard is never deployed to Cloudflare Pages. Only the public landing pages are. If the dashboard ever needs to be hosted, auth is a blocker, not a nice-to-have.

---

## Open questions carried forward from P0

Recorded at P0, to be resolved before the phase that depends on each.

| Question | Needed by |
|---|---|
| Control images: download and self-host, or hot-link GHL's CDN? (Recommendation: self-host — see `source/EXTRACTION-NOTES.md`) | P1 |
| The three source pages carry three different phone numbers between them; which is the "real" destination line per client vs a CallRail number already in use? | P4 |
| Only the J Valdez trimming page carries the hidden Ad Click ID field. Should the two Texas Tree Tops pages gain it? | P4 |
| GHL location ids and form ids were read out of public page markup. Confirm against the actual sub-accounts before wiring the API. | P4 |
