import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { localServer } from './local-server.mjs';
import assert from 'node:assert/strict';
import { build } from './build.mjs';

const html = await build();
const profile = await mkdtemp(path.join(tmpdir(), 'tienlen-browser-'));
const app = localServer(() => html);
const server = app.server;
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

import { existsSync } from 'node:fs';

const browserPath = process.env.CHROME_PATH || [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find(p => existsSync(p));

const chrome = spawn(
  browserPath,
  [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--no-first-run',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank'
  ],
  { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] }
);

let socket;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let data = '';
    const timer = setTimeout(() => reject(new Error('Chrome startup timeout')), 15000);
    chrome.on('error', reject);
    chrome.stderr.on('data', chunk => {
      data += chunk;
      const match = data.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });

  const pages = await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json`).then(r => r.json());
  socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));

  let seq = 0;
  const pending = new Map();
  const errors = [];

  socket.addEventListener('message', event => {
    const m = JSON.parse(event.data);
    if (m.id) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.reject(m.error);
      else p.resolve(m.result);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params.exceptionDetails);
    }
  });

  const cdp = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      const t = setTimeout(() => reject(new Error('CDP timeout ' + method)), 8000);
      pending.set(id, {
        resolve: r => { clearTimeout(t); resolve(r); },
        reject: e => { clearTimeout(t); reject(e); }
      });
      socket.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async expression => {
    const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/tien-len` });

  // Wait for cards to deal
  for (let i = 0; i < 40; i++) {
    const cardCount = await evaluate('document.querySelectorAll("#userCards .playing-card").length');
    if (cardCount === 13) break;
    await wait(100);
  }

  const title = await evaluate('document.title');
  assert.match(title, /Tiến Lên Miền Nam/);

  // Check 13 cards rendered in user's hand
  const cardsInHand = await evaluate('document.querySelectorAll("#userCards .playing-card").length');
  assert.equal(cardsInHand, 13);

  // Check clicking a card selects it
  await evaluate('document.querySelector("#userCards .playing-card").click()');
  const selectedCards = await evaluate('document.querySelectorAll("#userCards .playing-card.selected").length');
  assert.equal(selectedCards, 1);

  // Check responsive sizing without overflow
  for (const [w, h] of [[1920, 1080], [1024, 768], [390, 844]]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await wait(60);
    const hasOverflow = await evaluate('document.documentElement.scrollWidth > window.innerWidth');
    assert.equal(hasOverflow, false, `Horizontal overflow at ${w}x${h}`);
  }

  // Ensure no uncaught browser runtime errors
  assert.equal(errors.length, 0, `Browser had exceptions: ${JSON.stringify(errors)}`);

  console.log('✅ Tien Len browser checks passed successfully!');
} finally {
  if (socket) socket.close();
  chrome.kill();
  await app.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
