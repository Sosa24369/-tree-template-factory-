# Legal drafts — READ BEFORE USING

**Status: DRAFTS. Not reviewed by a lawyer. Not wired into any page.**

These were written unattended to close the A2P/10DLC consent-link gap: the lead
forms show an SMS consent checkbox, but the `consent.privacyPolicyUrl` and
`consent.termsOfServiceUrl` fields in each client record are blank, so the
checkbox links to nothing. Carriers expect the policy the consent language
points to to **name the sending business**. Until these (or the client's own
equivalents) are approved and hosted, that is an open compliance gap — see
`docs/OVERNIGHT_QUESTIONS.md` Q4.

## What you must do before these go live

1. **Have them reviewed.** I am not a lawyer; this is a starting draft, not
   legal advice. A Texas business attorney (or the client's own counsel)
   should review, especially the SMS/A2P section, the arbitration/liability
   terms, and anything specific to tree-service work on a customer's property.
2. **Fill every `[[BRACKETED]]` placeholder.** Each is something only you or
   the client knows: legal entity name/type, business mailing address, a
   contact email, and the effective date. They are listed at the top of each
   file.
3. **Host them** at a stable URL that names the business (the client's own
   domain is best; carriers dislike a shared agency domain that names nobody).
   Then paste the URLs into the client record's `consent.privacyPolicyUrl` and
   `consent.termsOfServiceUrl` — I deliberately left those blank.
4. **Re-verify A2P.** If the client's 10DLC campaign referenced a specific
   policy URL, update it there too.

## Coverage

- `j-valdez-privacy-policy.md`, `j-valdez-terms-of-service.md`
- `texas-tree-tops-privacy-policy.md`, `texas-tree-tops-terms-of-service.md`

`blank-co` is a template/placeholder client (no real service area, `+1 555…`
phone), so it has no drafts. Add drafts for any new real client the same way.
