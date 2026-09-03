#!/usr/bin/env node
// Prints a DASHBOARD_PASSWORD_HASH value for the password given on stdin or argv.
//   npm run hash-password -- 'your password'      or      echo -n 'pw' | npm run hash-password
import { hashPassword } from './auth.mjs';
const arg = process.argv.slice(2).join(' ');
const input = arg || (await new Promise((r) => { let d = ''; process.stdin.on('data', (c) => (d += c)); process.stdin.on('end', () => r(d.trim())); }));
if (!input) { console.error('usage: npm run hash-password -- <password>'); process.exit(1); }
console.log(hashPassword(input));
