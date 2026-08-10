// Independent fidelity check for the P0 source of truth.
// Extracts every quoted copy string from source/<page>/copy.md and proves it
// exists verbatim in the captured HTML (as page text, or as an alt/aria/placeholder value).
//
// Usage: node scripts/verify-source-fidelity.mjs
// Exit 1 if any copy string cannot be found in the source.
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const PAGES = ['removal', 'trimming', 'storm'];

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&middot;': '·' };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&[a-z]+;/gi, (m) => ENT[m.toLowerCase()] ?? m);

// Lines that are annotation prose, not copy records.
const isCopyRecord = (line) => /^\s*-\s+(h[1-6]|body|link|button|listItem|image|logoText|sub|main|placeholder|label|ariaLabel|alt|title|metaDescription|step|badge|eyebrow|caption|footer)\b/i.test(line);

let totalChecked = 0;
let totalMissing = 0;
const report = [];

for (const page of PAGES) {
  const copyPath = `${ROOT}source/${page}/copy.md`;
  const rawPath = `${ROOT}source/_raw/${page}.html`;
  if (!existsSync(copyPath) || !existsSync(rawPath)) { report.push(`${page}: MISSING FILES`); continue; }

  const raw = readFileSync(rawPath, 'utf8');
  // Haystack A: decoded full document — covers attribute values (alt/aria/placeholder)
  // and text that sits inside a single element.
  const hayAttrs = decode(raw).replace(/\s+/g, ' ');
  // Haystack B: markup stripped — covers headings GHL splits across sibling <span>s,
  // where the rendered string is contiguous but the source string is not.
  const hayText = decode(
    raw
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  ).replace(/\s+/g, ' ');

  const lines = readFileSync(copyPath, 'utf8').split('\n');
  const missing = [];
  let checked = 0;

  for (const line of lines) {
    if (!isCopyRecord(line)) continue;
    for (const m of line.matchAll(/"([^"]{2,})"/g)) {
      const s = m[1];
      if (!s.trim()) continue;
      checked++;
      const needle = s.replace(/\s+/g, ' ');
      if (!hayAttrs.includes(needle) && !hayText.includes(needle)) missing.push(s);
    }
  }

  totalChecked += checked;
  totalMissing += missing.length;
  report.push(`${page.padEnd(9)} copy strings checked: ${String(checked).padStart(4)}   not found in source: ${missing.length}`);
  for (const s of missing.slice(0, 12)) report.push(`    MISSING: ${JSON.stringify(s.slice(0, 110))}`);
}

console.log(report.join('\n'));
console.log(`\nTOTAL: ${totalChecked} strings checked, ${totalMissing} not found in the captured source.`);
process.exit(totalMissing === 0 ? 0 : 1);
