/**
 * R5 — FAQ accessibility guard.
 *
 * The defect: a FAQ pair with a blank question but a surviving answer used to render
 * a <summary> whose only content was an aria-hidden icon — a focusable disclosure
 * control with NO accessible name. A screen-reader user tabs onto it and hears
 * nothing.
 *
 * The fix (in every template's Faq.tsx): when the question is blank, render the
 * answer as plain text with no <summary> at all.
 *
 * This script scans the prerendered output and asserts that every <summary> that
 * ships has a non-whitespace accessible name once aria-hidden icon markup is removed.
 * It reads real HTML, so it catches the defect in whichever template still has it.
 *
 * Usage: node scripts/verify-faq-a11y.mjs   (run after `npm run build`)
 * Exit 1 on any empty-named summary.
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'app', 'dist');

if (!existsSync(DIST)) {
  console.error('missing app/dist — run `npm run build` in app/ first');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('index.html') ? [p] : [];
  });
}

/** Accessible name of a <summary>: its text with all element markup stripped. */
function accessibleName(inner) {
  return inner
    .replace(/<[^>]+>/g, '') // drop every tag (icons are markup, not text)
    .replace(/&[a-z]+;/gi, ' ') // entities → space, so &nbsp; alone is still "empty"
    .replace(/\s+/g, ' ')
    .trim();
}

const files = walk(DIST);
const summaryRe = /<summary\b[^>]*>([\s\S]*?)<\/summary>/gi;

let checked = 0;
let orphanAnswers = 0;
const empties = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = summaryRe.exec(html))) {
    checked++;
    if (!accessibleName(m[1])) {
      empties.push(`${relative(ROOT, file)}  <summary> with no accessible name`);
    }
  }
  // Count the orphan-answer fallback so the proof is visible: an answer with no
  // question renders as a plain block, never a summary.
  orphanAnswers += (html.match(/faq-item--orphan/g) || []).length;
}

console.log(`FAQ a11y: scanned ${files.length} page(s), ${checked} <summary> element(s), ${orphanAnswers} orphan-answer block(s).`);

if (empties.length) {
  console.log('');
  for (const e of empties) console.log(`FAIL  ${e}`);
  console.log(`\n${empties.length} empty-named <summary> element(s). R5 FAQ defect present.`);
  process.exit(1);
}
console.log('PASS  every <summary> that ships has a non-empty accessible name.');
