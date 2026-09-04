/**
 * a -> c COPY PARITY, as a script instead of a sentence.
 *
 * The -c hybrids exist to test DESIGN, not copy: removal-c renders removal-a's
 * exact words in removal-b's design direction, and likewise trimming and storm.
 * That property has been re-checked by hand after every reorder since the Design
 * Elevation session (2026-08-12) and reported as "a->c parity PASS" in
 * docs/BUILD-LOG.md, but it had no committed check — so it could regress silently
 * the first time someone edited a -c copy file. This is that check.
 *
 * Two levels, both mechanical:
 *
 *  1. SOURCE. The -c copy object must BE the -a copy object (===), not a copy of
 *     it. Structural identity is what makes drift impossible rather than merely
 *     unlikely: an edit to removal-a's copy IS an edit to removal-c's.
 *
 *  2. BUILT OUTPUT. For every client that has both pages, every visible text run
 *     on the -a page must also appear on the -c page. This catches the case the
 *     source check cannot: a -c SECTION that drops or rewrites a string its
 *     control renders.
 *
 *     PRESENCE, not count. The two designs deliberately place the same strings a
 *     different number of times — removal-a shows the phone number in four
 *     places, removal-c in three, and its CTA label appears once rather than
 *     twice. Those are design decisions about repetition, which is exactly what
 *     the -c variant is allowed to change. Copy parity is about WHICH words ship,
 *     not how often, so this compares sets.
 *
 * TWO known, documented exceptions. Both are named explicitly rather than waved
 * through by a loose comparison, and the second is PRINTED on every run so it
 * cannot quietly become permanent:
 *
 *   1. The prerendered <title> differs, because it is composed from the template
 *      LABEL ("Tree Removal — Control" vs "— Hybrid"). Metadata, not page copy.
 *
 *   2. The REQUIRED MARKER on the phone field. The controls render
 *      `form.label.phone` + `form.label.requiredMarker` ("Phone *"); the hybrids
 *      render the label alone ("Phone"). This predates the check — it came in
 *      with the hybrids' own form markup (removal-c/page.tsx:217,
 *      trimming-c/page.tsx:170) and was never caught by the manual passes. It is
 *      a one-character form affordance, not a copy variable, so it is tolerated
 *      here rather than "fixed" by editing pages that are already deployed; it is
 *      counted and listed on every run so the owner can decide.
 *      Anything else missing is a real failure.
 *
 * Usage: node scripts/verify-copy-parity.mjs   (run AFTER a build; exit 1 on drift)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'app', 'dist');
const SSR = join(ROOT, 'app', 'dist-ssr', 'entry-server.js');

if (!existsSync(SSR) || !existsSync(DIST)) {
  console.error('copy-parity: build first (cd app && npm run build)');
  process.exit(1);
}

const { COPY_DEFAULTS } = await import(SSR);
const PAIRS = [
  ['removal-a', 'removal-c'],
  ['trimming-a', 'trimming-c'],
  ['storm-a', 'storm-c'],
];

const failures = [];
const passes = [];

/* ---------------- 1. source-level identity ---------------- */
for (const [a, c] of PAIRS) {
  if (COPY_DEFAULTS[a] === COPY_DEFAULTS[c]) {
    passes.push(`SOURCE  ${c} is the same object as ${a} (${Object.keys(COPY_DEFAULTS[a]).length} keys) — cannot drift`);
  } else {
    const ka = Object.keys(COPY_DEFAULTS[a] ?? {});
    const kc = Object.keys(COPY_DEFAULTS[c] ?? {});
    const diff = [
      ...ka.filter((k) => COPY_DEFAULTS[a][k] !== COPY_DEFAULTS[c]?.[k]).map((k) => `${k} differs`),
      ...kc.filter((k) => !(k in COPY_DEFAULTS[a])).map((k) => `${k} only in ${c}`),
    ];
    failures.push(
      `SOURCE  ${c} no longer re-exports ${a}'s copy object` +
        (diff.length ? `: ${diff.slice(0, 6).join('; ')}${diff.length > 6 ? ` (+${diff.length - 6} more)` : ''}` : '')
    );
  }
}

/* ---------------- 2. built-output parity ---------------- */
const decodeEntities = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·');

/** Strip everything that is not visible page text, and decode entities. */
function visible(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      // The <title> is composed from the template label, which differs by design.
      .replace(/<title>[\s\S]*?<\/title>/gi, ' ')
  );
}

/** Every distinct text run between tags, whitespace-normalised. */
function textRuns(html) {
  const runs = new Set();
  for (const chunk of visible(html).split(/<[^>]+>/)) {
    const t = chunk.replace(/\s+/g, ' ').trim();
    if (t.length > 1) runs.add(t);
  }
  return runs;
}

/** The whole page as one normalised string, for substring containment. */
function flatText(html) {
  return visible(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function* clientDirs(baseDir) {
  if (!existsSync(baseDir)) return;
  for (const slug of readdirSync(baseDir)) {
    if (statSync(join(baseDir, slug)).isDirectory()) yield [baseDir, slug];
  }
}

let compared = 0;
let runsChecked = 0;
const tolerated = [];
for (const base of ['p', 'demo']) {
  for (const [dir, slug] of clientDirs(join(DIST, base))) {
    for (const [a, c] of PAIRS) {
      const fa = join(dir, slug, a, 'index.html');
      const fc = join(dir, slug, c, 'index.html');
      if (!existsSync(fa) || !existsSync(fc)) continue; // client excludes one of them
      compared++;
      const htmlA = readFileSync(fa, 'utf8');
      const htmlC = readFileSync(fc, 'utf8');
      // Containment, not equality of runs: the two designs split the same
      // sentence across a different number of elements (the control renders
      // several headings as two styled spans), so a run on one page can be a
      // fragment of a longer run on the other. The flat text of the -c page is
      // the haystack.
      const hayC = flatText(htmlC);
      const runsA = textRuns(htmlA);
      runsChecked += runsA.size;
      const missing = [];
      for (const run of runsA) {
        if (hayC.includes(run)) continue;
        // Exception 2: the run is present but for a trailing required marker.
        const withoutMarker = run.replace(/\s*\*$/, '').trim();
        if (withoutMarker !== run && withoutMarker.length > 1 && hayC.includes(withoutMarker)) {
          tolerated.push(`${relative(DIST, fc)}  ${JSON.stringify(run)} renders as ${JSON.stringify(withoutMarker)}`);
          continue;
        }
        missing.push(run);
      }
      if (missing.length) {
        failures.push(
          `BUILT   ${relative(DIST, fc)} is missing ${missing.length} text run(s) its control renders: ` +
            missing.slice(0, 6).map((m) => JSON.stringify(m.slice(0, 70))).join(', ')
        );
      }
    }
  }
}
if (compared) passes.push(`BUILT   ${compared} a/c page pair(s): all ${runsChecked} control text runs also appear on the hybrid (<title> excluded, by design)`);

for (const p of passes) console.log(`PASS  ${p}`);
if (tolerated.length) {
  console.log(`\nNOTE  ${tolerated.length} tolerated required-marker difference(s) — see exception 2 in this file's header:`);
  for (const t of tolerated) console.log(`      ${t}`);
}
if (failures.length) {
  console.log('');
  for (const f of failures) console.log(`FAIL  ${f}`);
  console.log(`\n${failures.length} copy-parity violation(s).`);
  process.exit(1);
}
console.log('\na -> c copy parity holds.');
