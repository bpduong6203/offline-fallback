import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { localServer } from './local-server.mjs';
import assert from 'node:assert/strict';
import { build } from './build.mjs';
import { existsSync } from 'node:fs';

const html = await build();
const profile = await mkdtemp(path.join(tmpdir(), 'uno-browser-'));
const app = localServer(() => html);
const server = app.server;
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browserPath = process.env.CHROME_PATH || [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find(p => existsSync(p));

if (!browserPath) {
  console.log('No Chrome or Edge found, skipping browser check');
  await app.close();
  process.exit(0);
}

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
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails);
    }
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: `http://127.0.0.1:${port}/uno` });
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Evaluate page status
  const evaluate = async expr => {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res.result.value;
  };

  const appMounted = await evaluate(`!!document.getElementById('unoApp')`);
  assert.equal(appMounted, true, 'unoApp should be mounted');

  const titleText = await evaluate(`document.querySelector('.brand-title').textContent`);
  assert.match(titleText, /UNO ARENA/);

  const eggBalance = await evaluate(`document.getElementById('userEggBalance').textContent`);
  assert.ok(parseInt(eggBalance, 10) >= 0);

  const opponentsCount = await evaluate(`document.querySelectorAll('.player-pod').length`);
  assert.ok(opponentsCount >= 1, 'Should have opponent pods rendered');

  const handCardsCount = await evaluate(`document.querySelectorAll('.uno-card.fan-card').length`);
  assert.ok(handCardsCount >= 1, 'Should have hand cards rendered');

  const hasDiscard = await evaluate(`document.getElementById('discardPile').classList.contains('uno-card')`);
  assert.equal(hasDiscard, true, 'Discard pile should render a card');

  assert.equal(errors.length, 0, `Page threw exceptions: ${JSON.stringify(errors)}`);

  console.log('UNO Browser check passed successfully! All elements verified.');
} finally {
  if (socket) socket.close();
  chrome.kill();
  await app.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
