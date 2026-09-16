# Amendment — run all four pages unattended, one gate at the end

Replaces section E of the amendment. Everything else stands.

Work the four pages in order without stopping for me: J Valdez
removal-a, J Valdez trimming-a, Texas Tree Tops removal-a, Texas Tree
Tops storm-a. Nothing goes live until I approve the whole batch.

## 0. Before the first edit — set up the rails, prove them

This session runs with permissions skipped, so a "don't publish" in
prose is a request. Make it a mechanism:

1. **Publish hook.** Add a `PreToolUse` hook on Bash for this project
   that blocks the publish/deploy command for the live pages and any
   `git push` to the production branch. First check whether Cloudflare
   Pages deploys this project from git; if it does, a push is a
   publish and the hook must catch it. Prove the hook works: attempt
   the publish command once, show me the blocked result verbatim, and
   only then start.
2. **Branch.** All work on one branch, `batch/four-pages`. One commit
   per item, item id first in the message (`R3: …`, `S2: …`), so any
   single item can be reverted without losing its page.
3. **Durable copies.** Save the amendment, this file, and the original
   removal-a scope into `docs/batch-four-pages/` before you start.
   Your context will compact during a run this long; when it does,
   re-read those three files and `decisions.md` before touching
   anything.
4. **Decision log.** Create `docs/batch-four-pages/decisions.md`.
   Append to it as you go — never only at the end.

## 1. The loop, per page

Build → verify → write evidence → log → re-read the stop list → next
page. A page is done when its evidence files exist on disk at
`docs/batch-four-pages/<page>/`:

- `before-390.png … after-1440.png` for every changed section
- `crops/<slot>.png` — original, focal point, cell at all three widths
- `phone-gtm-compare.txt` — the full compare output, all 55 pages
- `guards.txt` — 12/12 and criterion 8 per image box
- `lighthouse-before.json`, `lighthouse-after.json`, and a
  `summary.md` line with score, LCP, first-viewport image bytes
- `prerender-diff.txt` — every page that changed, protected ones
  marked, one line per page outside the target on why it's there
- `bundle.txt` — gzip delta, JS and CSS

If a file on that list doesn't exist, the page isn't done and you say
so; don't summarise evidence you didn't write.

Run the photo classification, the Lighthouse runs and the 55-page
compare in subagents and keep only their results in the main thread.

## 2. Decisions in my place

When you'd normally ask me: pick the option that keeps the diff
smallest and preserves what's live, log it in `decisions.md` with the
alternative you rejected, and keep going. The two I already answered
hold — areas stays the static wrapped list on every page, and
service-match photo swaps go into the section whose heading promises
that service, not page-wide.

If one page needs more than five such decisions, the scope is wrong:
stop there and show me the five.

## 3. Stop and wait for me if

- The phone/GTM compare shows any difference on any page.
- A guard fails, or criterion 8 fails on a box you can't fix.
- Lighthouse regresses on score, LCP or first-viewport bytes and you
  can't recover it on that page.
- JS + CSS gzip growth passes 3 KB total across the batch.
- A fix would need a headline, body copy, a review, or the ingest
  minimum changed in a way the amendment didn't authorize.
- The publish hook fires for any reason other than your proof run.

Otherwise don't stop. Reviews stay stubbed; don't wait on them.

## 4. What I get at the end

`docs/batch-four-pages/REPORT.md`: one section per page linking its
evidence folder, then the decision log, then the list of things you
left alone and why. Give me the folder path.

Then hold for one approval covering all four pages. Publish only after
I give it, and only after removing the hook you added in step 0.

---

Preceding instruction (same message): "Keep every edit you've made — don't revert. Before
you continue, do section 0 of the amendment below: the publish hook with proof, the
batch/four-pages branch (move the current edits onto it), the durable copies in
docs/batch-four-pages/, and decisions.md. Then resume removal-a where you left off and run
the rest unattended per the amendment."
