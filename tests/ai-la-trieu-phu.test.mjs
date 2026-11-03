import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { localMerit } from '../scripts/local-merit.mjs';
import { handleMeritRequest } from '../src/mebi-merit-api.js';

test('Ai Là Triệu Phú HTML files exist and are synchronized between root and src', async () => {
  const rootHtml = await readFile(new URL('../ai-la-trieu-phu.html', import.meta.url), 'utf8');
  const srcHtml = await readFile(new URL('../src/page/games/ai-la-trieu-phu.html', import.meta.url), 'utf8');

  assert.equal(rootHtml, srcHtml, 'ai-la-trieu-phu.html and src/page/games/ai-la-trieu-phu.html must match');

  // Verify core UI structure
  assert.ok(rootHtml.includes('<title>Ai Là Triệu Phú</title>'), 'must have correct title');
  assert.ok(rootHtml.includes('src="/merit.js"'), 'must include merit.js client script');
  assert.ok(rootHtml.includes('id="meritChip"'), 'must include merit badge chip');
  assert.ok(rootHtml.includes('id="lf-fifty"'), 'must include 50:50 lifeline');
  assert.ok(rootHtml.includes('id="lf-phone"'), 'must include call lifeline');
  assert.ok(rootHtml.includes('id="lf-aud"'), 'must include audience lifeline');
  assert.ok(rootHtml.includes('id="ladder"'), 'must include prize ladder');
  assert.ok(rootHtml.includes('id="qbox"'), 'must include question box');
  assert.ok(rootHtml.includes('const TIERS = ["e", "m", "h"]'), 'must have tiers e, m, h');
  assert.ok(rootHtml.includes('const PRIZES = ['), 'must have prize milestones');
  assert.ok(rootHtml.includes('const AU ='), 'must have audio synthesis engine');

  // Verify currency unit is "công đức" and matches reduced non-inflationary scale
  assert.ok(rootHtml.includes('<h2>Thang công đức</h2>'), 'must display Thang công đức');
  assert.ok(rootHtml.includes('const money = (n) => fmt(n) + " công đức"'), 'money formatting must use công đức');
  assert.ok(rootHtml.includes('1 công đức'), 'initial prize displays 1 công đức');
  assert.ok(rootHtml.includes('10 công đức'), 'milestone displays 10 công đức');
  assert.ok(rootHtml.includes('1.000 công đức'), 'top prize displays 1.000 công đức');
  assert.ok(!rootHtml.includes('200.000 đ'), 'must not contain old đ unit');
  assert.ok(!rootHtml.includes('150.000.000'), 'must not contain inflationary 150M prize');
});

test('Ai Là Triệu Phú question bank has valid 15-question progression with reduced non-inflationary prizes', async () => {
  const html = await readFile(new URL('../src/page/games/ai-la-trieu-phu.html', import.meta.url), 'utf8');

  // Verify tiers e, m, h contain question arrays
  assert.ok(html.includes('const QS = {'), 'must contain QS object declaration');
  assert.ok(html.includes('e: ['), 'must contain easy tier');
  assert.ok(html.includes('m: ['), 'must contain medium tier');
  assert.ok(html.includes('h: ['), 'must contain hard tier');

  // Extract prizes array and verify 15 reduced levels
  const prizesMatch = html.match(/const PRIZES = \[([\s\S]*?)\]/);
  assert.ok(prizesMatch, 'must contain PRIZES array');
  const prizeNumbers = prizesMatch[1].match(/\d+/g) || [];
  assert.equal(prizeNumbers.length, 15, 'must have exactly 15 prize levels');
  assert.equal(prizeNumbers[0], '1', 'first prize must be 1 công đức');
  assert.equal(prizeNumbers[4], '10', 'question 5 milestone must be 10 công đức');
  assert.equal(prizeNumbers[9], '100', 'question 10 milestone must be 100 công đức');
  assert.equal(prizeNumbers[14], '1000', 'top prize must be 1,000 công đức');
});

test('Ai Là Triệu Phú shared merit claiming adds to balance idempotently and validates prizes', async (t) => {
  const env = localMerit();
  t.after(() => env.close());

  const initReq = new Request('https://game.mebidev.site/api/merit');
  const initRes = await handleMeritRequest(initReq, env);
  const cookie = initRes.headers.get('Set-Cookie').split(';')[0];
  const post = (body) => handleMeritRequest(new Request('https://game.mebidev.site/api/merit/claim', {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }), env);

  // Rejects invalid payload / arbitrary unlisted prize (anti-inflation)
  const reqBad1 = await post({ requestId: 'altp-test-1234567890', prize: 999999 });
  assert.equal(reqBad1.status, 400);

  const reqBad2 = await post({ requestId: 'short', prize: 10 });
  assert.equal(reqBad2.status, 400);

  // Successfully claims milestone 1 (10 công đức)
  const reqId1 = 'altp-valid-req-1234567890abcdef';
  const claim1 = await post({ requestId: reqId1, prize: 10 });
  assert.equal(claim1.status, 200);
  const data1 = await claim1.json();
  assert.equal(data1.balance, 10, 'balance should now be 10');

  // Re-claiming with same requestId is idempotent
  const replay1 = await post({ requestId: reqId1, prize: 10 });
  assert.equal(replay1.status, 200);
  const replayData = await replay1.json();
  assert.equal(replayData.balance, 10, 'balance should stay 10 on duplicate request');

  // Claiming grand prize (1000 công đức)
  const reqId2 = 'altp-grand-req-1234567890abcdef';
  const claim2 = await post({ requestId: reqId2, prize: 1000 });
  assert.equal(claim2.status, 200);
  const data2 = await claim2.json();
  assert.equal(data2.balance, 1010, 'balance should now be 1010');
});

test('Ai Là Triệu Phú anti-cheat mechanisms are present in markup and script', async () => {
  const html = await readFile(new URL('../src/page/games/ai-la-trieu-phu.html', import.meta.url), 'utf8');

  // 1. Text selection disabling in CSS
  assert.ok(html.includes('user-select: none;'), 'CSS must disable user selection');
  assert.ok(html.includes('-webkit-user-select: none;'), 'CSS must disable webkit user selection');

  // 2. Anti-cheat rules in intro modal
  assert.ok(html.includes('<b>Chống gian lận</b>'), 'intro must display anti-cheat rule');
  assert.ok(html.includes('Khóa sao chép & chuột phải'), 'intro must explain copy & context menu lock');

  // 3. Toast warning container
  assert.ok(html.includes('anti-cheat-toast'), 'toast style/element must exist');

  // 4. Clipboard and context menu blocking listeners
  assert.ok(html.includes('addEventListener("copy"'), 'must block copy events');
  assert.ok(html.includes('addEventListener("cut"'), 'must block cut events');
  assert.ok(html.includes('addEventListener("contextmenu"'), 'must block contextmenu events');
  assert.ok(html.includes('addEventListener("selectstart"'), 'must block text selection start');

  // 5. Tab switching & window blur detection with disqualify()
  assert.ok(html.includes('function disqualify('), 'must declare disqualify function');
  assert.ok(html.includes('function isGameActive()'), 'must check if game is actively in session');
  assert.ok(html.includes('addEventListener("visibilitychange"'), 'must listen for visibility changes');
  assert.ok(html.includes('disqualify("chuyển tab sang ứng dụng khác")'), 'must disqualify on tab switch');
  assert.ok(html.includes('addEventListener("blur"'), 'must listen to window blur');
  assert.ok(html.includes('addEventListener("focus"'), 'must listen to window focus');

  // 6. Keyboard shortcut blocking for inspection and copying
  assert.ok(html.includes('["C", "X", "A", "U", "S", "P"]'), 'must intercept copy/source shortcuts');
  assert.ok(html.includes('F12'), 'must block devtools shortcut F12');
  assert.ok(html.includes('["I", "J", "C"]'), 'must block devtools inspector shortcuts');
});
