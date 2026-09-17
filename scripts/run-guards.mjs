/** Run one guard phase from the command line: node scripts/run-guards.mjs pre|post|rendered — the studio runs pre and post itself. */
import { runGuards } from '../server/guards.mjs';
const phase = process.argv[2] || 'pre';
const res = await runGuards(phase, { repoDir: new URL('..', import.meta.url).pathname, log: () => {} });
for (const r of res) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(14)} ${r.label}`);
console.log(`${phase}: ${res.filter(r=>r.ok).length}/${res.length} passed`);
if (res.some(r=>!r.ok)) { for (const r of res.filter(x=>!x.ok)) console.log(`\n--- ${r.id} ---\n${(r.output||'').slice(-1500)}`); process.exit(1); }
