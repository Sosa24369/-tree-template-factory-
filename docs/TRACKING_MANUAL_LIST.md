# TRACKING — MANUAL STEPS (things only you can click)

Everything here requires an account console and produces an ID the code must
never invent. The code side is DONE and waiting on these values; each section
says exactly where the value goes.

Ownership (decided, wired accordingly):
- **Form leads:** React form → `dataLayer` → GTM → Google Ads. The
  `generate_lead` event fires ONLY after `/api/lead` returns success.
- **Completed calls:** CallRail is primary. Do NOT build call conversions in
  GTM. The `click_to_call` dataLayer event is an engagement signal only —
  never wire it to an Ads conversion.

---

## 1. Google Ads — one lead conversion action per client

Do this once per client, in THAT client's Ads account:

1. Google Ads → **Goals** (left nav) → **Conversions** → **Summary**.
2. **+ New conversion action** → **Website**.
3. Enter the campaign domain → **Scan**. Ignore the URL-based suggestions —
   choose **Add a conversion action manually**.
4. Settings:
   - Goal category: **Submit lead form**.
   - Conversion name: `LP Lead — <Client Name>` (exact name matters only for
     your own sanity; the tag matches by ID/label, not name).
   - Value: **Don't use a value** (unless you decide otherwise later).
   - Count: **One** — this pairs with the transaction_id dedupe.
   - Click-through window / attribution: defaults are fine.
5. **Done** → on the "install the tag yourself" screen choose **Use Google
   Tag Manager**. Copy the **Conversion ID** (digits) and **Conversion
   label** (short string).
6. Paste both into section 2's GTM tag for that client.

## 2. GTM — per-client container wiring (repeat in each container)

Containers: J Valdez `GTM-PFZPR33H` · Texas Tree Tops `GTM-W32M4C6F`.
The pages already push these events (nothing to add on-site):
`page_context {client, template}` · `generate_lead {client, template,
transaction_id, submission_id}` · `click_to_call {placement}`.

In tagmanager.google.com, open the client's container:

1. **Variables → New (User-Defined)** — create three **Data Layer Variable**s:
   - name `dlv - transaction_id`, Data Layer Variable Name `transaction_id`
   - name `dlv - client`, Data Layer Variable Name `client`
   - name `dlv - template`, Data Layer Variable Name `template`
2. **Triggers → New** → **Custom Event**:
   - name `ev - generate_lead`, Event name `generate_lead`, fires on All
     Custom Events.
3. **Tags → New** → **Google Ads Conversion Tracking**:
   - name `Ads — LP Lead`
   - Conversion ID / Conversion Label: from section 1 (THIS client's values).
   - **Transaction ID: `{{dlv - transaction_id}}`** ← this is the dedupe;
     do not skip it.
   - Trigger: `ev - generate_lead`.
4. If the container lacks a **Conversion Linker** tag: **Tags → New →
   Conversion Linker**, trigger **All Pages**. (Required for click-id
   attribution.)
5. **Do NOT** create any tag on `click_to_call` beyond, at most, a GA4 event.
   No Ads conversion on it — calls are CallRail's.
6. **Submit → Publish** the container. Until published, the site loads GTM
   but fires nothing.

## 3. CallRail — swap script URL per client

1. CallRail → switch into the client's company → **Settings → Integrations →
   JavaScript Snippet** (called "Swap Target"/"Dynamic Number Insertion" in
   some plans).
2. Copy the snippet **src URL only** (looks like
   `//cdn.callrail.com/companies/<id>/<hash>/12/swap.js`).
3. Paste it into `clients/<slug>.json` → `tracking.callRailSwapScriptUrl`
   (currently `null`). The site loads it once per page and re-swaps on
   route changes automatically.
4. In CallRail, confirm the tracking number's **swap target** is the number
   the pages render (the client record's `phone.e164`) so DNI matches it in
   the DOM.

## 4. GHL — custom fields for full attribution (optional but recommended)

The Function already forwards `ad_click_id` into the existing custom field.
To also store gbraid/wbraid/fbclid and the five UTMs on the contact:

1. GHL → the client's sub-account → **Settings → Custom Fields → Add Field**
   → type **Single Line**. Create fields you care about, e.g. `UTM Source`,
   `UTM Campaign`, `GCLID`.
2. Open each field and copy its **ID** (in the field's URL / details pane).
3. Paste into `clients/<slug>.json` → `crm.attributionFieldIds`, e.g.:
   ```json
   "attributionFieldIds": {
     "gclid": "<fieldId>",
     "utm_source": "<fieldId>",
     "utm_campaign": "<fieldId>"
   }
   ```
4. Until then, those values appear in the Function's response/dry-run log as
   `droppedFields` — visible, not lost silently.

## 5. Verify after you publish (5 minutes, no deploy needed for 1–2)

1. `cd app && npx wrangler pages dev dist --compatibility-date=2026-08-11`,
   open a campaign URL with `?gclid=TEST123&utm_source=verify`, submit the
   form (dry-run: `.dev.vars` has `GHL_DRY_RUN`), and watch the terminal for
   the `[GHL_DRY_RUN]` line carrying the click id + submissionId.
2. In the browser console: `window.dataLayer` should show `page_context`,
   `gtm.js`, and after submit `generate_lead` with `transaction_id`.
3. After the GTM container is published: GTM **Preview** mode against the
   live page, submit a test lead, confirm the Ads tag fired once — then
   refresh the thank-you page and back-nav and confirm it does NOT fire again
   (same transaction_id).
