import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const hasBrowser = () => { try { return existsSync(CHROME); } catch { return false; } };
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Blocked on EVERY page this harness opens, local build or live. The local builds embed the
 *  clients' real GTM containers, so an unblocked local load fires real tags just as a live
 *  load does. A script's own setBlockedURLs is merged with this list, never a replacement. */
export const TRACKERS = ['*googletagmanager.com*', '*google-analytics.com*', '*analytics.google.com*',
  '*googleadservices.com*', '*doubleclick.net*', '*googlesyndication.com*', '*google.com/pagead*',
  '*google.com/ccm*', '*gstatic.com/wcm*', '*callrail.com*', '*calltrk.com*', '*leadconnectorhq.com*',
  '*msgsndr.com*', '*facebook.net*', '*facebook.com/tr*', '*clarity.ms*', '*bat.bing.com*'];
const TRACKER_HOST = /googletagmanager|google-analytics|analytics\.google|googleadservices|doubleclick|googlesyndication|google\.com\/(pagead|ccm)|gstatic\.com\/wcm|callrail|calltrk|leadconnectorhq|msgsndr|facebook\.(net|com\/tr)|clarity\.ms|bat\.bing/;
export async function launch({ port = 9333, width = 1440, height = 1000 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'cdp-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${width},${height}`, 'about:blank'], { stdio: 'ignore' });
  let version;
  for (let i = 0; i < 100; i++) { try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(100); } }
  if (!version) { proc.kill(); throw new Error('no debugging port'); }
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = (m) => { const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else listeners.forEach((f) => f(msg)); };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const n = ++id; pending.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) })); });
  return {
    send,
    async newPage(url) {
      const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
      const raw = (m, p) => send(m, p, sessionId);
      const S = (m, p) => m === 'Network.setBlockedURLs'
        ? raw(m, { urls: [...new Set([...TRACKERS, ...((p && p.urls) || [])])] })
        : raw(m, p);
      await S('Page.enable'); await S('Runtime.enable');
      await S('Network.enable');
      await S('Network.setBlockedURLs', { urls: [] });
      listeners.push((msg) => {
        if (msg.sessionId === sessionId && msg.method === 'Network.responseReceived' && TRACKER_HOST.test(msg.params.response.url))
          console.error('!!! TRACKER RESPONSE (block failed): ' + msg.params.response.url);
      });
      await S('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      const page = {
        send: S,
        async goto(u) { const done = new Promise((r) => { const f = (msg) => { if (msg.sessionId === sessionId && msg.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(f), 1); r(); } }; listeners.push(f); }); await S('Page.navigate', { url: u }); await done; },
        async eval(expr) { const r = await S('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval threw'); return r.result.value; },
        async waitFor(expr, { timeout = 15000 } = {}) { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (await page.eval(`return !!(${expr})`)) return true; await sleep(100); } throw new Error('timeout: ' + expr); },
        mouse: (type, x, y, extra = {}) => S('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, pointerType: 'mouse', ...extra }),
        async setViewport(w, h, dpr = 1) { await S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: false }); },
      };
      if (url) await page.goto(url);
      return page;
    },
    close() { try { ws.close(); } catch {} proc.kill(); },
  };
}
