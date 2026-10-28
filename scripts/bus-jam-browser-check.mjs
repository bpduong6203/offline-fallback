import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { localServer } from './local-server.mjs';

const profile = await mkdtemp(path.join(tmpdir(), 'bus-jam-'));
const app = localServer(() => 'ok');
const server = app.server;
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

import { existsSync } from 'node:fs';

const browserPaths = [
  process.env.CHROME_PATH,
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

const browserExe = browserPaths.find(p => existsSync(p));
if (!browserExe) throw Error('No Chrome or Edge browser found');

const chrome = spawn(
  browserExe,
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

try {
  const endpoint = await new Promise((resolve, reject) => {
    let data = '';
    const timer = setTimeout(() => reject(Error('Chrome startup timeout')), 15000);
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
  const socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));

  let seq = 0;
  const pending = new Map(), errors = [];
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

  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    const t = setTimeout(() => reject(Error('CDP timeout ' + method)), 8000);
    pending.set(id, {
      resolve: r => { clearTimeout(t); resolve(r); },
      reject: e => { clearTimeout(t); reject(e); }
    });
    socket.send(JSON.stringify({ id, method, params }));
  });

  const evaluate = async expression => {
    const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 420, height: 720, deviceScaleFactor: 2, mobile: true });

  await cdp('Page.navigate', { url: `http://127.0.0.1:${port}/__game/bus-escape` });
  await wait(800);

  const canvasExists = await evaluate('!!document.getElementById("bus-jam-canvas")');
  assert.equal(canvasExists, true, 'Canvas bus-jam-canvas must exist');

  const canvasWidth = await evaluate('document.getElementById("bus-jam-canvas").width');
  assert.ok(canvasWidth > 0, 'Canvas must have width');

  // Verify zero errors on page load
  assert.equal(errors.length, 0, 'No JS runtime exceptions on page load: ' + JSON.stringify(errors));

  // Simulate clicking on b1 (RED bus in Level 1 at (1,1))
  // Level 1: cell size = 344/6 = 57.3. bus at x:1, y:1.
  // StartX: 18. StartY: 236.
  // Canvas click at approx x: 18 + 1.5 * 57 = 103, y: 236 + 1.5 * 54 = 317
  await evaluate(`(() => {
    const canvas = document.getElementById('bus-jam-canvas');
    const rect = canvas.getBoundingClientRect();
    const evt = new PointerEvent('pointerdown', {
      clientX: rect.left + rect.width * (103 / 380),
      clientY: rect.top + rect.height * (317 / 580),
      bubbles: true
    });
    canvas.dispatchEvent(evt);
  })()`);

  await wait(1000);

  assert.equal(errors.length, 0, 'No JS runtime exceptions after interaction: ' + JSON.stringify(errors));

  // Screenshot capture to verify visual render
  const screenshot = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('C:/Users/Admin/.gemini/antigravity-ide/brain/25678847-7885-45c9-bcae-9501215c1666/bus_jam_screenshot.png', Buffer.from(screenshot.data, 'base64'));

  console.log('✓ Bus Jam Browser Check passed with 0 runtime errors!');
  socket.close();
} finally {
  chrome.kill();
  await app.close();
}
