/**
 * Auth for the editor — one admin password, a signed session cookie, a login rate
 * limit. No accounts, no database: this is a one-operator internal tool.
 *
 *  - DASHBOARD_PASSWORD_HASH  scrypt (Node built-in, no native dependency): the
 *    format is `scrypt$<saltB64>$<keyB64>`; make one with `npm run hash-password`.
 *    Compared with timingSafeEqual, and a wrong password costs the same time as a
 *    right one.
 *  - SESSION_SECRET           HMAC key for the cookie. Cookie = `<expiresMs>.<hmac>`,
 *    httpOnly, Secure (unless DASHBOARD_INSECURE_COOKIE=1 for local http), SameSite=Lax,
 *    12h expiry.
 *  - Login: 5 attempts per IP per 15 minutes, then 429.
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE = 'dash_session';
const SESSION_MS = 12 * 60 * 60 * 1000;
const LIMIT = { attempts: 5, windowMs: 15 * 60 * 1000 };
// N=2^15, r=8 needs 128*N*r = 32 MiB; Node's default maxmem is exactly 32 MiB, so it
// must be raised or scrypt throws ERR_CRYPTO_INVALID_SCRYPT_PARAMS.
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  try {
    const [algo, saltB64, keyB64] = String(stored || '').split('$');
    if (algo !== 'scrypt' || !saltB64 || !keyB64) return false;
    const expected = Buffer.from(keyB64, 'base64');
    const actual = scryptSync(String(password || ''), Buffer.from(saltB64, 'base64'), expected.length, SCRYPT);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function makeSessionCookie(secret, { insecure = false } = {}) {
  const exp = String(Date.now() + SESSION_MS);
  const value = `${exp}.${sign(exp, secret)}`;
  const attrs = ['HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${Math.floor(SESSION_MS / 1000)}`];
  if (!insecure) attrs.push('Secure');
  return `${COOKIE}=${value}; ${attrs.join('; ')}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function readSession(cookieHeader, secret) {
  const m = String(cookieHeader || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig) return false;
  const expected = sign(exp, secret);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now();
}

/** In-memory login limiter. Fine for a one-instance internal tool. */
export function makeLimiter() {
  const hits = new Map();
  return {
    check(ip) {
      const now = Date.now();
      const rec = hits.get(ip);
      if (!rec || rec.resetAt <= now) return true;
      return rec.count < LIMIT.attempts;
    },
    hit(ip) {
      const now = Date.now();
      const rec = hits.get(ip);
      if (!rec || rec.resetAt <= now) hits.set(ip, { count: 1, resetAt: now + LIMIT.windowMs });
      else rec.count++;
    },
    reset(ip) { hits.delete(ip); },
    retryAfterSeconds(ip) { const rec = hits.get(ip); return rec ? Math.max(1, Math.ceil((rec.resetAt - Date.now()) / 1000)) : 0; },
  };
}

export function loginPage({ error = '' } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sign in — content editor</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:15px/1.5 system-ui,sans-serif;background:#f4f6f8;color:#1a2430}form{background:#fff;padding:28px 28px 24px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.08);width:min(92vw,360px)}h1{font-size:18px;margin:0 0 4px}p{margin:0 0 18px;color:#5f6b78;font-size:13px}label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #dde3e9;border-radius:8px;font-size:15px}button{margin-top:14px;width:100%;padding:11px;border:0;border-radius:8px;background:#1f6f4a;color:#fff;font-weight:600;font-size:15px;cursor:pointer}.err{background:#fde8e8;color:#9b1c1c;padding:8px 10px;border-radius:6px;font-size:13px;margin-bottom:12px}</style></head>
<body><form method="post" action="/login" autocomplete="off"><h1>Content editor</h1><p>Landing-page factory · authorised users only</p>${error ? `<div class="err">${error}</div>` : ''}<label for="p">Password</label><input id="p" name="password" type="password" required autofocus><button type="submit">Sign in</button></form></body></html>`;
}
