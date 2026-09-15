# Open item: alt text that claims stock photos as the client's own work

Raised by the owner 2026-09-15. **Nothing here is fixed.** This is the write-up the owner asked
for, to decide separately. All findings are from the build of `9058f10` (= `origin/main`) and,
where marked, the live site.

## The problem

Three photographs under `app/public/assets/_shared/` are generic stock that appears on both
source sites (Texas Tree Tops and J Valdez) in the GoHighLevel services section. They are no
client's work. They sit in the Texas Tree Tops record's removal set (entries 20–22) with **no
alt text of their own**, so the templates compose one, and every composed alt names the
client and calls the photo a job:

| file | what it shows |
|---|---|
| `_shared/services-card-photo-1-ecd55f38.webp` | a gloved hand cutting a small branch with hand pruners |
| `_shared/services-card-photo-2-a6cb4660.webp` | an old tree stump in weeds and undergrowth |
| `_shared/services-card-photo-3-1290bfcd.webp` | a cut section of trunk resting on sawdust (houses behind that do not look like Texas) |

The alt is not visible. Screen readers speak it, and search engines index it.

## Every instance

**Texas Tree Tops — 10 instances on 3 pages**

| page | slot | file | alt today |
|---|---|---|---|
| `/p/texas-tree-tops/removal-a` **(live ad page)** | Recent jobs rail, cell 19 | photo-1 | "Texas Tree Tops tree removal job, photo 19" |
| same | rail, cell 20 | photo-2 | "Texas Tree Tops tree removal job, photo 20" |
| same | rail, cell 21 | photo-3 | "Texas Tree Tops tree removal job, photo 21" |
| same | services strip, cell 1 | photo-3 | "Texas Tree Tops tree removal job, photo 1" |
| `/p/texas-tree-tops/trimming-a` | Recent jobs, 3 cells | photo-1, 2, 3 | "Texas Tree Tops tree trimming job, photo 6 / 7 / 8" |
| `/p/texas-tree-tops/agnostic` | work grid, 3 cells | photo-1, 2, 3 | "Texas Tree Tops — completed work, photo 19 / 20 / 21" |

Texas Tree Tops' other live page, storm-a, has none. Its removal-a Benefits photo
(`_template/removal-a/benefit-strip-art`, alt "Texas Tree Tops tree removal job, photo 1") is
correctly attributed: the source manifest takes it from texastreetopsllc.com.

**Summit Tree Co (demo: `noindex, nofollow`, no GTM) — 6 instances on removal-a.** Its record
does give the three stock photos descriptive alts, and most slots use them, but removal-a's hero
proof strip (2), services strip (3) and Benefits photo (1, the Texas Tree Tops photograph)
ignore a record alt and compose "Summit Tree Co tree removal job, photo N". Two of Summit's
descriptive alts are also inaccurate: "…with **bypass loppers**" (they are hand pruners) and
"Cut stump left **at ground level after a tree was taken down**" (it is an old, overgrown
stump).

## J Valdez — the same problem with their own name?

- **Stock or another company's photo under their name: once, live today, already fixed on
  `main`.** The live `/p/j-valdez/removal-a` shows Texas Tree Tops' Benefits photograph with
  alt "J Valdez Tree Services tree removal job, photo 1". Commit `3ac4952` replaces it with
  J Valdez's own photo; that ships at the next publish. After it, no J Valdez page carries a
  `_shared/` or `_template/` photograph.
- **Their own photos, wrong service: yes, 19 instances.** All 12 J Valdez photographs are
  filed as trimming, and the five that carry their own record alt describe trimming. removal-a composes
  "J Valdez Tree Services tree removal job, photo N" for 16 images (live ad page), and
  removal-b for 3. It is the client's work, so the name is true, but "removal" is not what
  those photos show. `hero-photo-2` is the parked fleet, not a job.
- **Empty alt on real photos:** 5 images on removal-c and 4 on trimming-c render `alt=""`,
  which tells a screen reader they are decoration. That is an accessibility gap, not a false
  claim.

## What I would replace it with

**The three stock photos.** Describe the picture, with no company name and no "job":

| file | proposed alt |
|---|---|
| photo-1 | "Gloved hand cutting a small branch with hand pruners" |
| photo-2 | "Old tree stump surrounded by weeds and undergrowth" |
| photo-3 | "Cut section of a tree trunk resting on sawdust" |

How, smallest first:

1. **Record only (no code).** Add those three alts to the Texas Tree Tops record's entries. Every slot
   that already prefers a record alt picks them up: the removal-a rail (3), trimming-a (3)
   and agnostic (3). That covers **9 of 10**, and changes only alt attributes.
2. **One line of template code** for the tenth: removal-a's services strip (and its hero proof
   and Benefits slots) always compose the alt. Making them prefer the record's alt, as the
   rail already does, fixes the services strip cell on Texas Tree Tops. It fixes Summit's six.
   On J Valdez the services strip and Benefits photos (work-photo-3/4/5) carry no record alt,
   so they would not change. If the hero proof strip changes too, J Valdez's cell 2
   (`gallery-slide-1`) goes from "J Valdez Tree Services tree removal job, photo 2" to its own
   record alt, "Before and after tree trimming - cleared branches and debris hauled away, East
   Dallas TX": more accurate, but still a change on a live page.
3. **Correct Summit's two inaccurate alts** to the text above.
4. **A guard**, so this cannot come back: a `_shared/` or `_template/` photograph rendered
   with an alt containing the client's name fails the build. R4 checks paths, which is why
   neither this nor the Benefits photo was caught.

The bigger alternative is to **remove the three stock photos from the Texas Tree Tops record
altogether**. They are not the client's work. But that changes the live removal-a layout
(the rail loses 3 cells, and the services strip takes a different first photo), so it goes
through the gate as a visual change rather than an attribute change.

**J Valdez's service word.** The composed alt should follow the set the photo came from,
not the page it is on, so a trimming photo on removal-a reads "J Valdez Tree Services tree
trimming job, photo N". Better still: give each of the 12 photos its own descriptive record
alt, as five already have, and the templates use it. `hero-photo-2` would read along the lines
of "J Valdez Tree Services trucks and crew on a residential street". It is a template change on
live removal-a, attributes only.

Every option above changes alt attributes on a live ad page, so each goes through the
live-campaign gate like any other change.
