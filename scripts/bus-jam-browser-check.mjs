import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { localServer } from './local-server.mjs';

const profile = await mkdtemp(path.join(tmpdir(), 'bus-jam-'));
const app = localServer(() => 'ok');
const server = app.server;
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

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
  await wait(600);

  const canvasExists = await evaluate('!!document.getElementById("bus-jam-canvas")');
  assert.equal(canvasExists, true, 'Canvas bus-jam-canvas must exist');
  assert.equal(errors.length, 0, 'No JS runtime exceptions on page load: ' + JSON.stringify(errors));

  const clickCanvasAt = async (logicX, logicY) => {
    await evaluate(`(() => {
      const canvas = document.getElementById('bus-jam-canvas');
      const rect = canvas.getBoundingClientRect();
      const evt = new PointerEvent('pointerdown', {
        clientX: rect.left + rect.width * (${logicX} / 380),
        clientY: rect.top + rect.height * (${logicY} / 580),
        bubbles: true
      });
      canvas.dispatchEvent(evt);
    })()`);
  };

  console.log('--- Step 1: Click Bus 1 (RED) ---');
  // b1: col 1, row 1 -> x: 16 + 1.5 * 58 = 103, y: 236 + 1.5 * 54.6 = 318
  await clickCanvasAt(103, 318);
  await wait(1500); // Wait for b1 to slide, 3 red passengers to board, and bus to depart

  console.log('--- Step 2: Click Bus 2 (BLUE) ---');
  // b2: col 3, row 1 -> x: 16 + 3.5 * 58 = 219, y: 236 + 1.5 * 54.6 = 318
  await clickCanvasAt(219, 318);
  await wait(1500); // Wait for b2 to slide, 3 blue passengers to board, and bus to depart

  console.log('--- Step 3: Click Bus 3 (YELLOW) ---');
  // b3: col 2, row 4 -> x: 16 + 3.0 * 58 = 190, y: 236 + 4.5 * 54.6 = 481
  await clickCanvasAt(190, 481);
  await wait(1800); // Wait for b3 to slide, 3 yellow passengers to board, bus to depart and Win modal to show

  assert.equal(errors.length, 0, 'No JS runtime exceptions during level 1: ' + JSON.stringify(errors));

  // Save Victory screenshot
  const shotWin = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('C:/Users/Admin/.gemini/antigravity-ide/brain/25678847-7885-45c9-bcae-9501215c1666/bus_jam_victory.png', Buffer.from(shotWin.data, 'base64'));

  console.log('--- Step 4: Click Next Level Button on Victory Modal ---');
  // Victory button is centered at (190, H / 2 + 70) = (190, 360)
  await clickCanvasAt(190, 360);
  await wait(800);

  // Save Round 2 screenshot
  const shotLvl2 = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('C:/Users/Admin/.gemini/antigravity-ide/brain/25678847-7885-45c9-bcae-9501215c1666/bus_jam_round2.png', Buffer.from(shotLvl2.data, 'base64'));

  console.log('✓ Successfully completed Round 1 and advanced to Round 2!');
  socket.close();
} finally {
  chrome.kill();
  await app.close();
}
