import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {serveImage, imageKey} from '../src/image-assets.js';
import {EGG_ICON_URL} from '../tien-len/egg-asset.js';
import {localServer} from '../scripts/local-server.mjs';

const path = '/__assets/images/tien-len/egg-icon.e56a156104e0.webp';
const request = (method = 'GET', headers = {}, url = path) => new Request('https://games.test' + url, {method, headers});
const object = (body = 'image') => ({
  body, size: 5, httpEtag: '"image-v1"', uploaded: new Date('2026-10-01T00:00:00Z'),
  writeHttpMetadata(headers) { headers.set('Content-Type', 'text/html'); headers.set('Cache-Control', 'private'); }
});

test('image paths restrict public namespace, extensions, encoding and traversal', () => {
  assert.equal(imageKey(path), 'images/tien-len/egg-icon.e56a156104e0.webp');
  for (const bad of [
    '/__assets', '/__assets/', '/__assets/private/key.webp', '/__assets/images/../a.webp',
    '/__assets/images/a/../../secret.webp', '/__assets/images/%2e%2e/a.webp',
    '/__assets/images/%252e%252e/a.webp', '/__assets/images/a%5cb.webp',
    '/__assets/images/%00.webp', '/__assets/images/%zz.webp', '/__assets/images//a.webp',
    '/__assets/images/.hidden.webp', '/__assets/images/a.html', '/__assets/images/a.js',
    '/__assets/images/a.svg/secret', '/__assets/images/a..webp', '/__assets/images/' + 'a'.repeat(513) + '.webp'
  ]) assert.equal(imageKey(bad), null, bad);
});

test('R2 GET streams body, returns correct image type, etag and immutable cache', async () => {
  const keys = [];
  const response = await serveImage(request(), {IMAGES: {get: async key => { keys.push(key); return object(); }}}, undefined, null);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'image');
  assert.deepEqual(keys, ['images/tien-len/egg-icon.e56a156104e0.webp']);
  assert.equal(response.headers.get('Content-Type'), 'image/webp');
  assert.equal(response.headers.get('ETag'), '"image-v1"');
  assert.match(response.headers.get('Cache-Control'), /max-age=31536000, immutable/);
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.match(response.headers.get('Content-Security-Policy'), /sandbox/);
});

test('HEAD uses R2 head without fetching a body; unversioned assets expire', async () => {
  let heads = 0;
  const env = {IMAGES: {head: async () => { heads++; return object(); }, get: async () => { throw Error('must not read body'); }}};
  const response = await serveImage(request('HEAD', {}, '/__assets/images/logo.png'), env, undefined, null);
  assert.equal(response.status, 200); assert.equal(await response.text(), ''); assert.equal(heads, 1);
  assert.equal(response.headers.get('Content-Length'), '5');
  assert.equal(response.headers.get('Content-Type'), 'image/png');
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=3600, s-maxage=86400');
});

test('missing images are uncached 404, unavailable storage is uncached 503', async () => {
  const missing = await serveImage(request(), {IMAGES: {get: async () => null}}, undefined, null);
  assert.equal(missing.status, 404); assert.equal(missing.headers.get('Cache-Control'), 'no-store');
  assert.equal((await serveImage(request(), {}, undefined, null)).status, 503);
  const failure = await serveImage(request(), {IMAGES: {get: async () => { throw Error('private details'); }}}, undefined, null);
  assert.equal(failure.status, 503); assert.ok(!(await failure.text()).includes('private details'));
});

test('public writes and invalid keys never access R2', async () => {
  const env = {IMAGES: {get() { throw Error('unexpected R2 call'); }}};
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const response = await serveImage(request(method), env, undefined, null);
    assert.equal(response.status, 405); assert.equal(response.headers.get('Allow'), 'GET, HEAD');
  }
  assert.equal((await serveImage(request('GET', {}, '/__assets/images/%252e%252e/a.webp'), env, undefined, null)).status, 400);
});

test('conditional image requests support weak/list etags and date precedence', async () => {
  const env = {IMAGES: {get: async () => object()}};
  for (const headers of [
    {'If-None-Match': 'W/"image-v1"'}, {'If-None-Match': '"other", "image-v1"'},
    {'If-None-Match': '*'}, {'If-Modified-Since': 'Thu, 01 Oct 2026 00:00:00 GMT'}
  ]) {
    const response = await serveImage(request('GET', headers), env, undefined, null);
    assert.equal(response.status, 304); assert.equal(await response.text(), '');
    assert.equal(response.headers.has('Content-Length'), false);
  }
  assert.equal((await serveImage(request('GET', {'If-None-Match': '"other"', 'If-Modified-Since': 'Thu, 01 Oct 2026 00:00:00 GMT'}), env, undefined, null)).status, 200);
});

test('edge cache stores full GETs after response and serves GET/HEAD/304 without R2', async () => {
  const entries = new Map(), jobs = []; let reads = 0;
  const cache = {async match(req) { return entries.get(req.url)?.clone(); }, async put(req, res) { entries.set(req.url, res); }};
  const ctx = {waitUntil(job) { jobs.push(job); }};
  const env = {IMAGES: {async get() { reads++; return object(); }}};
  const first = await serveImage(request(), env, ctx, cache); assert.equal(await first.text(), 'image'); await Promise.all(jobs);
  assert.equal(entries.size, 1);
  assert.equal(await (await serveImage(request('GET', {}, path + '?v=2'), env, ctx, cache)).text(), 'image');
  assert.equal(await (await serveImage(request('HEAD'), env, ctx, cache)).text(), '');
  assert.equal((await serveImage(request('GET', {'If-None-Match': '"image-v1"'}), env, ctx, cache)).status, 304);
  assert.equal(reads, 1);
});

test('local asset route serves identical source WebP and rejects missing images and writes', async () => {
  const bytes = await readFile(new URL('../tien-len/egg_icon.webp', import.meta.url));
  assert.ok(EGG_ICON_URL.includes(createHash('sha256').update(bytes).digest('hex').slice(0, 12)));
  const app = localServer(() => 'unused'); await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${app.server.address().port}`;
    const response = await fetch(base + EGG_ICON_URL);
    assert.equal(response.status, 200); assert.equal(response.headers.get('Content-Type'), 'image/webp');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
    assert.equal((await fetch(base + '/__assets/images/missing.webp')).status, 404);
    assert.equal((await fetch(base + EGG_ICON_URL, {method: 'PUT', body: 'no'})).status, 405);
  } finally { await app.close(); }
});
