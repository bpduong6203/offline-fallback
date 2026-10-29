import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { localServer } from './local-server.mjs';
import { renderOffline } from '../src/page/render.js';

const profile = await mkdtemp(path.join(tmpdir(), '2048-browser-'));

// Chuẩn bị HTML trang Fallback
async function getFallbackHtml() {
  const req = new Request('http://localhost/', { headers: { Accept: 'text/html' } });
  const res = renderOffline(req);
  return await res.text();
}

const app = localServer(getFallbackHtml);
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
  console.error('Không tìm thấy trình duyệt Chrome hoặc Edge để chạy test CDP');
  process.exit(1);
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
    const timer = setTimeout(() => reject(new Error('Browser startup timeout')), 15000);
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

  socket.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails.text);
    }
    const handler = pending.get(msg.id);
    if (handler) {
      pending.delete(msg.id);
      if (msg.error) handler.reject(new Error(msg.error.message));
      else handler.resolve(msg.result);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });

  const evalExpr = async expr => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluate error');
    }
    return res.result?.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 480,
    height: 820,
    deviceScaleFactor: 2,
    mobile: true
  });

  console.log(`[1/6] Điều hướng đến http://127.0.0.1:${port}/...`);
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
  await new Promise(r => setTimeout(r, 1000));

  // Kiểm tra tab 2048
  console.log('[2/6] Kiểm tra nút tab 2048 trên trang chủ...');
  const tabExists = await evalExpr(`!!document.querySelector('.tab[data-g="2048"]')`);
  assert.equal(tabExists, true, 'Nút tab 2048 phải tồn tại trong DOM');

  // Click chọn tab 2048
  console.log('[3/6] Click chuyển sang tab 2048...');
  await evalExpr(`document.querySelector('.tab[data-g="2048"]').click()`);
  await new Promise(r => setTimeout(r, 300));

  const uiVisible = await evalExpr(`!document.getElementById('game2048ui').hidden`);
  assert.equal(uiVisible, true, 'Khối game2048ui phải hiển thị');

  const canvasWidth = await evalExpr(`document.getElementById('g').width`);
  assert.ok(canvasWidth > 0, 'Canvas #g phải có kích thước hợp lệ');

  // Thao tác phím trượt ô
  console.log('[4/6] Thao tác phím mũi tên trượt ô và gộp điểm...');
  await evalExpr(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 150));
  await evalExpr(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 150));
  await evalExpr(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 150));
  await evalExpr(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))`);
  await new Promise(r => setTimeout(r, 150));

  // Kiểm tra các nút tương tác
  console.log('[5/6] Thử nút Đổi Theme, Đổi Chế độ và Hoàn tác...');
  await evalExpr(`document.getElementById('g2048Theme').click()`);
  await new Promise(r => setTimeout(r, 100));
  await evalExpr(`document.getElementById('g2048Mode').click()`);
  await new Promise(r => setTimeout(r, 100));
  await evalExpr(`document.getElementById('g2048Undo').click()`);
  await new Promise(r => setTimeout(r, 100));

  assert.equal(errors.length, 0, `Không được có lỗi runtime: ${errors.join('; ')}`);

  // Chụp ảnh màn hình nghiệm thu
  console.log('[6/6] Chụp ảnh màn hình nghiệm thu...');
  const { data: b64 } = await send('Page.captureScreenshot', { format: 'png' });
  await mkdir(path.resolve('dist'), { recursive: true });
  await writeFile(path.resolve('dist/2048-home-preview.png'), Buffer.from(b64, 'base64'));
  console.log('✅ Đã lưu ảnh nghiệm thu tại dist/2048-home-preview.png');

  console.log('🎉 Toàn bộ bài test trình duyệt trang chủ 2048 ĐÃ VƯỢT QUA!');
} finally {
  if (socket) socket.close();
  chrome.kill();
  await app.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
