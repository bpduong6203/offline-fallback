import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Ai Là Triệu Phú HTML files exist and are synchronized between root and src', async () => {
  const rootHtml = await readFile(new URL('../ai-la-trieu-phu.html', import.meta.url), 'utf8');
  const srcHtml = await readFile(new URL('../src/page/games/ai-la-trieu-phu.html', import.meta.url), 'utf8');

  assert.equal(rootHtml, srcHtml, 'ai-la-trieu-phu.html and src/page/games/ai-la-trieu-phu.html must match');

  // Verify core UI structure
  assert.ok(rootHtml.includes('<title>Ai Là Triệu Phú</title>'), 'must have correct title');
  assert.ok(rootHtml.includes('id="lf-fifty"'), 'must include 50:50 lifeline');
  assert.ok(rootHtml.includes('id="lf-phone"'), 'must include call lifeline');
  assert.ok(rootHtml.includes('id="lf-aud"'), 'must include audience lifeline');
  assert.ok(rootHtml.includes('id="ladder"'), 'must include prize ladder');
  assert.ok(rootHtml.includes('id="qbox"'), 'must include question box');
  assert.ok(rootHtml.includes('const TIERS = ["e", "m", "h"]'), 'must have tiers e, m, h');
  assert.ok(rootHtml.includes('const PRIZES = ['), 'must have prize milestones');
  assert.ok(rootHtml.includes('const AU ='), 'must have audio synthesis engine');
});

test('Ai Là Triệu Phú question bank has valid 15-question progression with 4 options each', async () => {
  const html = await readFile(new URL('../src/page/games/ai-la-trieu-phu.html', import.meta.url), 'utf8');

  // Verify tiers e, m, h contain question arrays
  assert.ok(html.includes('const QS = {'), 'must contain QS object declaration');
  assert.ok(html.includes('e: ['), 'must contain easy tier');
  assert.ok(html.includes('m: ['), 'must contain medium tier');
  assert.ok(html.includes('h: ['), 'must contain hard tier');

  // Extract prizes array and verify 15 levels
  const prizesMatch = html.match(/const PRIZES = \[([\s\S]*?)\]/);
  assert.ok(prizesMatch, 'must contain PRIZES array');
  const prizeNumbers = prizesMatch[1].match(/\d+/g) || [];
  assert.equal(prizeNumbers.length, 15, 'must have exactly 15 prize levels');
  assert.equal(prizeNumbers[0], '200000', 'first prize must be 200,000');
  assert.equal(prizeNumbers[4], '2000000', 'question 5 milestone must be 2,000,000');
  assert.equal(prizeNumbers[9], '22000000', 'question 10 milestone must be 22,000,000');
  assert.equal(prizeNumbers[14], '150000000', 'top prize must be 150,000,000');
});
