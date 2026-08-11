# Build log — known-unresolved items carried in the build

Things that are deliberately not fixed in code, because the fix is not code.
Reviewed at every phase boundary.

---

## (817) 607-3485 is printed inside the Texas Tree Tops logo image

**Status: untracked by design, pending a replacement logo from the client.**

The Texas Tree Tops logo artwork has a phone number rendered into the image itself —
`(817) 607-3485`, visible in the badge, and a fourth number distinct from the three
in the page markup. It appears in the header and the footer of every Texas Tree Tops
page.

**Consequence:** CallRail DNI swaps text nodes and `tel:` hrefs. It cannot swap a
number that is part of a raster image. **Any call placed from the number printed in
the logo is untracked and always will be**, regardless of what we do at P4.

No workaround has been attempted, per instruction — a number baked into an image is
not something to engineer around. A clean logo without the number will be supplied,
and dropping it into `brand.logoUrl` resolves this with no code change.

---

## Texas Tree Tops has no `ad_click_id` custom field in GHL

**Status: pending creation in GHL location `zfoeYpKrqshgdFr4gG3b`.**

Click IDs (`gclid` / `gbraid` / `wbraid` / `fbclid`) are captured, persisted for the
session and submitted with every lead on every template — that part is built and
verified. They will not land on a mapped GHL contact field for this client until the
custom field exists.

`clients/texas-tree-tops.json` → `crm.adClickIdFieldId` is `null`, which the resolver
surfaces as a warning on every render. Set it to the new field id once created; no
code change.

For comparison, J Valdez already has the field: `DTlYvWAb5Y0M3iXyWfcH`
(`contact.ad_click_id`, `data-q="gclid"`).

---

## Per-client Privacy Policy and Terms are not yet available

**Status: blank, pending each client's own policies.**

Both clients previously pointed at the same agency URLs on `links.treeleads.io`. A2P
registration expects the policy to name the sender, so shared agency policies are not
acceptable. `consent.privacyPolicyUrl` and `consent.termsOfServiceUrl` are now empty
strings on both records, with a `legalUrlsPending` note.

**Consequence while blank:** the consent block renders its opt-in and SMS language but
carries no policy links. That is an A2P compliance gap, and it is a reason not to run
SMS from these pages yet. The resolver warns on every render.

---

## Destination phone numbers are unconfirmed

**Status: HOLD on any deploy that routes real calls.**

- Texas Tree Tops — currently `+16824520735`. Most source call buttons dialled
  `+16823657478` instead, so these are different lines and only one of them rings the
  client.
- J Valdez — currently `+14694021196`. This same number appears on both Texas Tree
  Tops pages, so it may be an agency/shared tracking number rather than J Valdez's own.

Both are GHL tracking numbers that forward to each company's real business line.

**Until both are confirmed against their GHL sub-accounts, no page that routes calls
gets deployed.** Everything is otherwise deploy-ready; correcting a number is a
one-line change in the client record and a rebuild.

---

## Google review avatars cannot be self-hosted

**Status: resolved by design — avatars dropped.**

Two review avatar images returned HTTP 403; Google blocks hotlinking and blocks
downloading them. Per instruction, no workaround was attempted. Review cards render
an initials circle plus the star rating, the reviewer's name and the review text
(`reviewAvatarStyle: "initials"`).

---

## CallRail DNI will be a second forwarding hop

**Status: decision needed at P4, recorded now so it is not a surprise.**

Both clients' numbers are already GHL tracking numbers that forward to the real
business line. Adding CallRail DNI on top makes the chain:

    CallRail number -> GHL tracking number -> business line

Two hops of forwarding. It works, but it adds latency, can affect caller ID, and
means two systems are independently claiming attribution for the same call. The
alternative is pointing CallRail directly at the business line and giving up GHL's
native call logging. This is a business decision, not a technical one.
