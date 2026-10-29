import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAssetRequest, getMimeType, isValidAssetKey } from '../src/asset-handler.js';

function createMockR2(store = {}) {
  return {
    async get(key) {
      if (!Object.prototype.hasOwnProperty.call(store, key)) return null;
      const item = store[key];
      const body = typeof item.body === 'string' ? new TextEncoder().encode(item.body) : item.body;
      return {
        body,
        httpEtag: item.etag || '"mock-etag-123"',
        httpMetadata: {
          contentType: item.contentType
        },
        writeHttpMetadata(headers) {
          if (item.contentType) headers.set('Content-Type', item.contentType);
        }
      };
    }
  };
}

test('getMimeType correctly maps extensions', () => {
  assert.equal(getMimeType('egg_icon.webp'), 'image/webp');
  assert.equal(getMimeType('photo.png'), 'image/png');
  assert.equal(getMimeType('image.jpg'), 'image/jpeg');
  assert.equal(getMimeType('image.jpeg'), 'image/jpeg');
  assert.equal(getMimeType('vector.svg'), 'image/svg+xml');
  assert.equal(getMimeType('anim.gif'), 'image/gif');
  assert.equal(getMimeType('icon.ico'), 'image/x-icon');
  assert.equal(getMimeType('modern.avif'), 'image/avif');
  assert.equal(getMimeType('unknown.xyz'), 'application/octet-stream');
});

test('isValidAssetKey blocks path traversal, backslashes and dangerous characters', () => {
  assert.equal(isValidAssetKey('egg_icon.webp'), true);
  assert.equal(isValidAssetKey('subfolder/image.png'), true);

  // Traversal & illegal characters
  assert.equal(isValidAssetKey('../secret.txt'), false);
  assert.equal(isValidAssetKey('sub/../../secret.txt'), false);
  assert.equal(isValidAssetKey('/leading-slash.png'), false);
  assert.equal(isValidAssetKey('\\leading-backslash.png'), false);
  assert.equal(isValidAssetKey('path\\with\\backslash.png'), false);
  assert.equal(isValidAssetKey('null\0byte.png'), false);
  assert.equal(isValidAssetKey('..%2fencoded.png'), false);
  assert.equal(isValidAssetKey(''), false);
  assert.equal(isValidAssetKey(null), false);
});

test('handleAssetRequest serves R2 asset with 200 and static cache headers', async () => {
  const env = {
    IMAGES: createMockR2({
      'egg_icon.webp': {
        body: 'fake-webp-binary',
        etag: '"etag-webp-1"',
        contentType: 'image/webp'
      }
    })
  };

  const req = new Request('https://mebidev.site/__assets/egg_icon.webp');
  const res = await handleAssetRequest(req, env);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'image/webp');
  assert.equal(res.headers.get('ETag'), '"etag-webp-1"');
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
  const text = await res.text();
  assert.equal(text, 'fake-webp-binary');
});

test('handleAssetRequest supports HEAD method with headers and empty body', async () => {
  const env = {
    IMAGES: createMockR2({
      'egg_currency.png': {
        body: 'huge-image-binary',
        etag: '"etag-png-99"',
        contentType: 'image/png'
      }
    })
  };

  const req = new Request('https://mebidev.site/__assets/egg_currency.png', { method: 'HEAD' });
  const res = await handleAssetRequest(req, env);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'image/png');
  assert.equal(res.headers.get('ETag'), '"etag-png-99"');
  const body = await res.text();
  assert.equal(body, '');
});

test('handleAssetRequest returns 304 when ETag matches If-None-Match', async () => {
  const env = {
    IMAGES: createMockR2({
      'egg_icon.webp': {
        body: 'fake-webp-binary',
        etag: '"etag-match-123"'
      }
    })
  };

  const req = new Request('https://mebidev.site/__assets/egg_icon.webp', {
    headers: { 'If-None-Match': '"etag-match-123"' }
  });
  const res = await handleAssetRequest(req, env);
  assert.equal(res.status, 304);
});

test('handleAssetRequest returns 404 for missing asset', async () => {
  const env = { IMAGES: createMockR2({}) };
  const req = new Request('https://mebidev.site/__assets/missing.png');
  const res = await handleAssetRequest(req, env);
  assert.equal(res.status, 404);
});

test('handleAssetRequest returns 403 for path traversal and invalid keys', async () => {
  const env = { IMAGES: createMockR2({}) };

  const req1 = new Request('https://mebidev.site/__assets/..%2fsecrets.txt');
  assert.equal((await handleAssetRequest(req1, env)).status, 403);

  const req2 = new Request('https://mebidev.site/__assets/%252e%252e/secrets.txt');
  assert.equal((await handleAssetRequest(req2, env)).status, 403);

  const req3 = new Request('https://mebidev.site/__assets/dir%5cfile.png');
  assert.equal((await handleAssetRequest(req3, env)).status, 403);
});

test('handleAssetRequest rejects unsafe HTTP methods (POST, PUT, DELETE)', async () => {
  const env = { IMAGES: createMockR2({}) };

  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
    const req = new Request('https://mebidev.site/__assets/egg.png', { method });
    const res = await handleAssetRequest(req, env);
    assert.equal(res.status, 405);
    assert.equal(res.headers.get('Allow'), 'GET, HEAD');
  }
});

test('handleAssetRequest returns 503 if IMAGES binding is missing', async () => {
  const req = new Request('https://mebidev.site/__assets/egg.png');
  const res = await handleAssetRequest(req, {});
  assert.equal(res.status, 503);
});

