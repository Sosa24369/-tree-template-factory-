# Photos — how to put the right one in the right place

For the owner. Everything here is a control that exists in the deployed studio.

## The short version

Open a client, pick a template in the preview bar at the top right, then click
**Photos on this page** in the panel list. You get every photo slot on that page, top to
bottom in the order they appear, each showing the crop that will actually ship.

That list is the answer to "what will end up on the page". It is not an approximation —
the thumbnail uses the same box and the same framing the page uses.

## Putting a photo in a slot

Each slot row has cells. Under every cell:

| Control | What it does |
|---|---|
| **↑** / **↓** | Swap this photo with the cell above or below, anywhere on the page |
| **Choose…** | Pick any photo this client already has |
| **Upload here** | Take a file off your computer straight into this slot |
| **Remove** | Leave the slot empty. The photo stays in the client's library |
| **Reset to auto** | Stop choosing; go back to filling this slot by position |

Any of those is one click. **Upload here** is the shortest path from a file to a page:
click it, pick the file, done.

## auto vs explicit

Every cell is labelled one or the other.

**auto** means the slot is filled by position — first photo in the set goes to the first
slot, and so on. That is how every page worked before, and how a client you have not
touched still works.

**explicit** means you chose that photo for that slot. It stays there when the set is
reordered. You only ever get explicit by choosing; nothing converts on its own, and
nothing rewrites a client you have not edited.

## Uploading a batch

In **Business & contact**, each service set has **Upload photos**. It takes many files at
once. Every file goes through the same pipeline: turned the right way up, stripped of
location data, cropped to 4:3, and re-saved at four sizes.

**Shape** beside the button is normally *4:3 — the contract*. Change it to *Keep the
original shape* only for a photo that must not be cropped.

There is no dialog to get through. Files go in and land. If one is refused you get the
reason and the number on the spot, and the others still go through.

Two refusals you will see:

- **Too small.** "500 px wide, a 4:3 tile needs 1200. Send a larger original — the
  pipeline never upscales." Blowing a small photo up would only make it blurry, so the
  studio will not do it.
- **HEIC.** iPhone photos in Apple's own format are refused with export instructions.
  The studio has no way to read them.

## Framing

**Frame** on a photo card sets the subject. Click the thing that must survive the crop —
the climber, the truck, the house — and every slot that crops the photo keeps it centred
on that point.

Frame lists **every** slot the photo lands in and shows the crop at phone, tablet and
desktop width. If a photo feeds the big picture behind the headline *and* a narrow strip,
you see both before you save.

Framing is optional. A photo you never frame is centred, which is usually fine for a
wide shot and usually wrong for a person.

## The three statuses

Every cell carries one. Hover it for the number.

**OK** — big enough, the right shape, crops cleanly. Nothing to do.

**Under spec** — it will render, and it will look soft on a good screen. Worth replacing
when better originals turn up, not worth blocking anything over.

**Replace** — framing cannot fix it. Too small to ever look right, or a video sitting in
a photo set. Ask the client for another photograph.

The **Readiness** panel totals these per client and — the part worth acting on — names
which slots are currently filled by a **Replace** photo. One sitting unused in the
library harms nothing; one on a page does.

## What this does not do

- It does not change what a client already published. A record you have not edited
  renders exactly as it did.
- It does not invent photographs. A slot with nothing to put in it stays empty, and the
  section around it hides itself.
- It does not make a small photo bigger. Nothing can.

## Saving and publishing

Placement is part of the client record, so it saves and publishes like any other edit:
**Review & save**, then **Publish**. If a change would alter one of the live ad pages,
the publish gate shows you those pages before anything ships.

---

*No screenshots here: `docs/` has never carried images, and adding the first ones is a
change worth making deliberately rather than in passing. Say the word and they go in.*
