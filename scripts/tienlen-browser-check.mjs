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
  await wait(200);

  const title = await evaluate('document.title');
  assert.match(title, /Tiến Lên Miền Nam/);

  // 1. Verify Mode Selection Menu is visible on initial load
  const isMenuVisible = await evaluate('getComputedStyle(document.getElementById("menuOverlay")).display !== "none"');
  assert.equal(isMenuVisible, true, 'Menu overlay should be visible on initial load');

  // Verify all 3 options exist in the DOM
  assert.equal(await evaluate('!!document.getElementById("btnStartSolo")'), true);
  assert.equal(await evaluate('!!document.getElementById("btnMenuCreateRoom")'), true);
  assert.equal(await evaluate('!!document.getElementById("btnMenuJoinRoom")'), true);

  // 2. Click "Chơi ngay với máy"
  await evaluate('document.getElementById("btnStartSolo").click()');
  await wait(300);

  // Verify menu is hidden and cards are dealt
  for (let i = 0; i < 40; i++) {
    const cardCount = await evaluate('document.querySelectorAll("#userCards .playing-card").length');
    if (cardCount === 13) break;
    await wait(100);
  }
  const cardsInHand = await evaluate('document.querySelectorAll("#userCards .playing-card").length');
  assert.equal(cardsInHand, 13, 'User should have 13 cards');

  // Verify selecting a card
  await evaluate('document.querySelector("#userCards .playing-card").click()');
  const selectedCards = await evaluate('document.querySelectorAll("#userCards .playing-card.selected").length');
  assert.equal(selectedCards, 1, 'Clicked card should have .selected class');

  // Verify Egg currency badge and icon are rendered
  const eggBalance = await evaluate('document.getElementById("userEggBalance").textContent');
  assert.equal(parseInt(eggBalance, 10) >= 0, true, 'Egg balance should be numeric');
  const hasEggIcon = await evaluate('!!document.querySelector(".egg-currency-img")');
  assert.equal(hasEggIcon, true, 'Egg currency icon should be rendered');

  // 3. Click "Về Menu" button
  await evaluate('document.getElementById("btnMenu").click()');
  await wait(200);
  const menuReopened = await evaluate('getComputedStyle(document.getElementById("menuOverlay")).display !== "none"');
  assert.equal(menuReopened, true, 'Menu should reopen after clicking Về Menu');

  // 4. Click "Tạo phòng mới" to test multiplayer room lobby
  await evaluate('document.getElementById("btnMenuCreateRoom").click()');
  await wait(500);

  const isLobbyVisible = await evaluate('getComputedStyle(document.getElementById("lobbyOverlay")).display !== "none"');
  assert.equal(isLobbyVisible, true, 'Lobby overlay should be visible after creating room');

  const roomIdText = await evaluate('document.getElementById("lobbyRoomId").textContent');
  assert.match(roomIdText, /^#[A-Z0-9]{4}$/, 'Room ID should be formatted as #XXXX');
  const roomCode = roomIdText.replace('#', '');

  // Connect a friend peer via WebSocket
  const friendWs = new WebSocket(`ws://127.0.0.1:${server.address().port}/__game/ws?g=tienlen&room=${roomCode}&action=join&name=FriendPlayer`);
  await new Promise(resolve => friendWs.addEventListener('open', resolve, { once: true }));

  const friendMessages = [];
  friendWs.addEventListener('message', ev => {
    try { friendMessages.push(JSON.parse(ev.data)); } catch (e) {}
  });

  await wait(300);

  // Host clicks "Bắt đầu chơi"
  await evaluate('document.getElementById("btnLobbyStart").click()');
  await wait(500);

  // Verify lobby closed and match started
  const isLobbyClosed = await evaluate('getComputedStyle(document.getElementById("lobbyOverlay")).display === "none"');
  assert.equal(isLobbyClosed, true, 'Lobby overlay should close when match starts');

  // Find latest state for both host and guest
  const hostState = await evaluate('window.__tl_test_state || { currentTurn: document.querySelector(".player-pod.active")?.id, has3S: !!document.querySelector("#userCards [data-id=\'3_0\']") }');
  const friendState = friendMessages.filter(m => m.t === 'state').pop();
  assert.ok(friendState, 'Friend should have received state message');

  const hostHas3S = await evaluate('!!document.querySelector("#userCards [data-id=\'3_0\']")');
  const friendHas3S = friendState.state.players.find(p => p.id === 1)?.hand?.some(c => c.value === 3 && c.suit === 0);

  assert.ok(hostHas3S || friendHas3S, 'One of the two human players must hold 3 of Spades');

  if (hostHas3S) {
    // Host is the first player!
    const pod0Active = await evaluate('document.getElementById("pod0").classList.contains("active")');
    assert.equal(pod0Active, true, 'Host pod0 should be active when Host goes first');

    const pod0Status = await evaluate('document.querySelector("#pod0 .status-tag").textContent');
    assert.ok(pod0Status.includes('Đến lượt bạn'), 'Host status should indicate it is their turn');

    // Select 3 of Spades
    await evaluate('document.querySelector("#userCards [data-id=\'3_0\']").click()');
    const playEnabled = await evaluate('!document.getElementById("btnPlay").disabled');
    assert.equal(playEnabled, true, 'btnPlay should be enabled when 3 of Spades is selected');

    // Click "Đánh bài"
    await evaluate('document.getElementById("btnPlay").click()');
    await wait(400);

    // Verify 3 of Spades is now in the center arena!
    const arenaCardCount = await evaluate('document.querySelectorAll("#arenaCards .playing-card").length');
    assert.equal(arenaCardCount, 1, 'Arena should display the played card');
    const arenaVal = await evaluate('document.querySelector("#arenaCards .card-val").textContent');
    assert.equal(arenaVal, '3', 'Played card must be 3');
  } else {
    // Friend is the first player!
    const friendTurn = friendState.state.currentTurn;
    assert.equal(friendTurn, 1, 'Friend (id: 1) should have the first turn');

    // Friend plays 3 of Spades
    friendWs.send(JSON.stringify({ t: 'play', cardIds: ['3_0'] }));
    await wait(400);

    // Verify Host sees Friend's card in center arena!
    const arenaCardCount = await evaluate('document.querySelectorAll("#arenaCards .playing-card").length');
    assert.equal(arenaCardCount, 1, 'Host should see Friend played card in arena');
    const arenaVal = await evaluate('document.querySelector("#arenaCards .card-val").textContent');
    assert.equal(arenaVal, '3', 'Played card in arena must be 3');
  }

  friendWs.close();
  await wait(200);

  // Return to menu
  await evaluate('document.getElementById("btnMenu").click()');
  await wait(200);
  const menuBack = await evaluate('getComputedStyle(document.getElementById("menuOverlay")).display !== "none"');
  assert.equal(menuBack, true, 'Should return to menu after clicking btnMenu');

  // 5. Check responsive sizing without overflow
  for (const [w, h] of [[1920, 1080], [1024, 768], [390, 844]]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await wait(60);
    const hasOverflow = await evaluate('document.documentElement.scrollWidth > window.innerWidth');
    assert.equal(hasOverflow, false, `Horizontal overflow at ${w}x${h}`);
  }

  // Ensure no uncaught browser runtime errors
  assert.equal(errors.length, 0, `Browser had exceptions: ${JSON.stringify(errors)}`);

  console.log('✅ Tien Len menu, solo, and room lobby browser checks passed successfully!');
} finally {
  if (socket) socket.close();
  chrome.kill();
  await app.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
