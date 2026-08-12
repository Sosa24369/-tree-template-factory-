# OVERNIGHT — OPEN QUESTIONS FOR FAIZAN

Written unattended. Each item is something I deliberately did NOT decide on my
own because it involves money, risk, legal wording, or a design tradeoff you
have not already made. Nothing here is blocking a commit — the code that
shipped tonight is safe and the gaps below are documented, not hidden.

---

## Q1 — /api/lead is an open, unauthenticated lead-injection endpoint (from T3)

**What.** Anyone who can send an HTTP POST (curl, a script — not just a
browser) can submit leads into a real client's GoHighLevel location. The only
current defense is the hidden `company_website` honeypot, which a targeted
attacker simply omits. Cross-origin *browser* JS is blocked by CORS preflight,
but non-browser clients are unrestricted. Consequence: a flood of junk contacts
into a client's CRM, each potentially firing "new lead" SMS/automations — real
cost and reputational spam.

**Why I stopped.** The fix is a design + money tradeoff (adds friction, maybe a
vendor), and it touches the live lead path. Not mine to pick.

**Options.**
1. **Cloudflare Turnstile** on the form + token verification in the Function.
   Free, invisible-ish, strongest against bots. Adds a script + one env secret.
   *(Recommended.)*
2. **Rate-limit by IP** in the Function (Cloudflare KV or a Durable Object) —
   e.g. N submits/min/IP. Cheap, blunt, no user friction; won't stop a
   distributed low-rate attacker.
3. **HMAC the payload** with a per-page nonce minted server-side at page load —
   stops naive replay/scripts, more moving parts, no help against a real
   browser-driving bot.
4. **Accept the risk for now** — low traffic, GHL dedupes on phone. Revisit if
   spam appears.

**My recommendation:** Turnstile (1) before spend scales; it's the only option
that actually addresses bots rather than volume. I can wire it behind a
`TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET` pair on your say-so.

## Q2 — Server-side replay/idempotency: enforce, or lean on GHL? (from T3)

**What.** The `submissionId` the form mints is logged by the Function but never
*enforced*. A captured POST replayed N times re-upserts the same phone (GHL
dedupes the contact) but re-fires tag-add automations and refreshes consent
timestamps each time; replayed with a mutated phone, it creates N contacts.

**Options.**
1. **Do nothing** — rely on GHL's phone-upsert. Simplest; accepts repeated
   automation fires. *(Recommended for now — low real-world risk, and Q1's
   bot control is the bigger lever.)*
2. **Short-TTL idempotency store** (Cloudflare KV keyed on `submissionId`,
   ~10 min) — the Function drops a duplicate before calling GHL. Real
   protection; adds a KV binding and a small per-request read.

**My recommendation:** (1) now, reconsider alongside Q1 if you add KV anyway.

## Q3 — Storm-copy decisions (blocking storm-a / storm-b, restated from BACKLOG)

Storm templates are not built and I was told not to build them. Three wording
decisions are yours and block the copy:

1. **Response-time promise.** What do we commit to on a storm lead — "we call
   within 30 minutes", "same day", or no time promise? (Legal/ops exposure if
   we name a number we can't hit at 2am.)
2. **After-hours calls: yes or no?** Do storm pages invite a phone call 24/7,
   or push to the form outside business hours? Affects the hero CTA and the
   phone-link visibility.
3. **The offer.** Is there a storm-specific offer (free assessment / emergency
   dispatch / priority scheduling), and if so exact wording? Or the same
   estimate CTA as the other templates?

Once you answer, storm-a/storm-b copy can be drafted (still no deploy).

## Q4 — Legal drafts need your review before they can close the A2P gap (from T4)

I wrote per-client Privacy Policy + Terms of Service DRAFTS
(`docs/legal-drafts/`) but did NOT wire them into any page or fill the blank
`consent.privacyPolicyUrl` / `termsOfServiceUrl` fields. **Until you approve
them and they are hosted at a URL that names each business, the consent
checkboxes on the forms have no policy links — which is an open A2P/10DLC
compliance gap.** They also contain bracketed placeholders (business legal
entity, email, mailing address) only you can fill. See the drafts' own
header notes.
