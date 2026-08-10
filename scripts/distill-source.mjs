// Produce tractable extracts from raw GHL funnel HTML.
// No deps. Outputs: <name>.text.txt (ordered visible text w/ tag markers),
// <name>.images.txt, <name>.form.txt, <name>.meta.txt
import { readFileSync, writeFileSync } from 'node:fs';

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&reg;': '®', '&trade;': '™', '&copy;': '©', '&check;': '✓' };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&[a-z]+;/gi, (m) => ENT[m.toLowerCase()] ?? m);

const name = process.argv[2];
const src = process.argv[3];
const outDir = process.argv[4];
let html = readFileSync(src, 'utf8');

// ---------- meta / tracking (before stripping scripts) ----------
const meta = [];
const uniq = (arr) => [...new Set(arr)];
const grab = (re) => uniq([...html.matchAll(re)].map((m) => m[0]));
meta.push('== TRACKING IDS ==');
meta.push('GTM: ' + grab(/GTM-[A-Z0-9]{6,}/g).join(', '));
meta.push('GA4: ' + grab(/G-[A-Z0-9]{10}/g).join(', '));
meta.push('Google Ads: ' + grab(/AW-\d{9,}/g).join(', '));
meta.push('Facebook Pixel: ' + uniq([...html.matchAll(/fbq\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/g)].map((m) => m[1])).join(', '));
meta.push('CallRail: ' + uniq([...html.matchAll(/cdn\.callrail\.com[^"'\s]*/g)].map((m) => m[0])).join(', '));
meta.push('');
meta.push('== TEL LINKS (in document order, with duplicates) ==');
meta.push([...html.matchAll(/tel:([^"'\s<>\\]+)/g)].map((m) => m[1]).join('\n'));
meta.push('');
meta.push('== TITLE / META ==');
meta.push('title: ' + (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''));
[...html.matchAll(/<meta[^>]+>/gi)].slice(0, 40).forEach((m) => {
  if (/name=|property=/i.test(m[0])) meta.push(m[0].slice(0, 300));
});
meta.push('');
meta.push('== GHL IDS ==');
meta.push('locationId candidates: ' + uniq([...html.matchAll(/"locationId"\s*:\s*"([A-Za-z0-9]{15,25})"/g)].map((m) => m[1])).join(', '));
meta.push('formId candidates: ' + uniq([...html.matchAll(/"formId"\s*:\s*"([A-Za-z0-9]{15,25})"/g)].map((m) => m[1])).join(', '));
meta.push('contact.* field keys: ' + uniq([...html.matchAll(/contact\.[a-z_]+/g)].map((m) => m[0])).join(', '));

// ---------- form fields ----------
const form = [];
form.push('== FORM FIELD ELEMENTS (document order) ==');
const fieldRe = /<(input|textarea|select|button)\b[^>]*>/gi;
for (const m of html.matchAll(fieldRe)) form.push(m[0].slice(0, 500));
form.push('');
form.push('== FIELD LABELS ==');
for (const m of html.matchAll(/<label[^>]*>([\s\S]{0,200}?)<\/label>/gi)) {
  const t = decode(m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  if (t) form.push(`${(m[0].match(/for="([^"]*)"/) || [, ''])[1]}  ->  ${t}`);
}
form.push('');
form.push('== SUBMIT / CTA BUTTON TEXT ==');
for (const m of html.matchAll(/<button[^>]*>([\s\S]{0,300}?)<\/button>/gi)) {
  const t = decode(m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  if (t) form.push(t);
}

// ---------- images ----------
const imgs = [];
imgs.push('== IMAGES (document order) ==');
for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
  const tag = m[0];
  const src = (tag.match(/\ssrc="([^"]*)"/) || [, ''])[1];
  const alt = (tag.match(/\salt="([^"]*)"/) || [, ''])[1];
  const w = (tag.match(/\swidth="([^"]*)"/) || [, ''])[1];
  const h = (tag.match(/\sheight="([^"]*)"/) || [, ''])[1];
  const lazy = /loading="lazy"/.test(tag) ? ' lazy' : '';
  imgs.push(`${src}\t| alt="${decode(alt)}"\t| ${w}x${h}${lazy}`);
}
imgs.push('');
imgs.push('== CSS BACKGROUND IMAGES ==');
for (const u of new Set([...html.matchAll(/background-image:\s*url\((['"]?)([^'")]+)\1\)/gi)].map((m) => m[2]))) imgs.push(u);
imgs.push('');
imgs.push('== VIDEO / IFRAME ==');
for (const m of html.matchAll(/<(iframe|video|source)\b[^>]*>/gi)) imgs.push(m[0].slice(0, 300));

// ---------- visible text in DOM order ----------
let body = html;
body = body.replace(/<script[\s\S]*?<\/script>/gi, ' ');
body = body.replace(/<style[\s\S]*?<\/style>/gi, ' ');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
body = body.replace(/<!--[\s\S]*?-->/g, ' ');
body = body.replace(/<head[\s\S]*?<\/head>/i, ' ');

// mark structural tags so section order survives
body = body.replace(/<(h[1-6])\b[^>]*>/gi, (_, t) => `\n[[${t.toUpperCase()}]] `);
body = body.replace(/<\/(h[1-6])>/gi, '\n');
body = body.replace(/<li\b[^>]*>/gi, '\n[[LI]] ');
body = body.replace(/<br\s*\/?>/gi, '\n');
body = body.replace(/<\/(p|div|section|tr|td)>/gi, '\n');
body = body.replace(/<a\b[^>]*href="(tel:[^"]*)"[^>]*>/gi, (_, h) => `\n[[LINK ${h}]] `);
body = body.replace(/<a\b[^>]*href="([^"]*)"[^>]*>/gi, (_, h) => `\n[[LINK ${h}]] `);
body = body.replace(/<button\b[^>]*>/gi, '\n[[BUTTON]] ');
body = body.replace(/<[^>]+>/g, ' ');
body = decode(body);
const lines = body.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 0);

// collapse consecutive duplicates (GHL renders desktop+mobile copies)
const out = [];
for (const l of lines) if (out[out.length - 1] !== l) out.push(l);

writeFileSync(`${outDir}/${name}.text.txt`, out.join('\n'), 'utf8');
writeFileSync(`${outDir}/${name}.images.txt`, imgs.join('\n'), 'utf8');
writeFileSync(`${outDir}/${name}.form.txt`, form.join('\n'), 'utf8');
writeFileSync(`${outDir}/${name}.meta.txt`, meta.join('\n'), 'utf8');
console.log(`${name}: text_lines=${out.length} images=${imgs.length} form_lines=${form.length}`);
