const PREFIX = '/__assets/';
const TYPES = Object.freeze({
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
  svg: 'image/svg+xml', ico: 'image/x-icon'
});

// Decode once, then allow only a canonical, ASCII image key in our public namespace.
// A remaining percent sign rejects double encoding; '..' is forbidden anywhere.
export function imageKey(pathname) {
  if (!pathname.startsWith(PREFIX)) return null;
  let key;
  try { key = decodeURIComponent(pathname.slice(PREFIX.length)); } catch { return null; }
  if (key.length > 512 || key.includes('..') ||
      !/^images\/(?:[A-Za-z0-9][A-Za-z0-9._-]*\/)*[A-Za-z0-9][A-Za-z0-9._-]*$/.test(key)) return null;
  const extension = key.split('.').pop().toLowerCase();
  return TYPES[extension] ? key : null;
}

function error(status, message, extra = {}) {
  return new Response(message, {status, headers: {'Cache-Control': 'no-store', ...extra}});
}

function notModified(request, headers) {
  const condition = request.headers.get('If-None-Match');
  if (condition !== null) {
    const etag = headers.get('ETag');
    return condition.split(',').some(value => value.trim() === '*' ||
      (etag && value.trim().replace(/^W\//, '') === etag));
  }
  const since = Date.parse(request.headers.get('If-Modified-Since') || '');
  const modified = Date.parse(headers.get('Last-Modified') || '');
  return Number.isFinite(since) && Number.isFinite(modified) && modified <= since;
}

function conditionalResponse(request, response) {
  if (notModified(request, response.headers)) {
    const headers = new Headers(response.headers);
    headers.delete('Content-Length');
    void response.body?.cancel().catch(() => {});
    return new Response(null, {status: 304, headers});
  }
  if (request.method === 'HEAD') {
    void response.body?.cancel().catch(() => {});
    return new Response(null, {headers: response.headers});
  }
  return response;
}

export async function serveImage(request, env, ctx, edgeCache = globalThis.caches?.default) {
  if (!['GET', 'HEAD'].includes(request.method)) return error(405, 'Method Not Allowed', {Allow: 'GET, HEAD'});
  const url = new URL(request.url);
  const key = imageKey(url.pathname);
  if (!key) return error(400, 'Invalid image path');
  if (!env?.IMAGES) return error(503, 'Image storage unavailable');

  // Query parameters do not select different objects. Cache one canonical URL per key.
  const cacheRequest = new Request(url.origin + PREFIX + key, {method: 'GET'});
  try {
    if (edgeCache) {
      // A cache failure must not prevent an otherwise healthy R2 read.
      const cached = await edgeCache.match(cacheRequest).catch(() => undefined);
      if (cached) return conditionalResponse(request, cached);
    }
    const object = request.method === 'HEAD' ? await env.IMAGES.head(key) : await env.IMAGES.get(key);
    if (!object) return error(404, 'Image not found');

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    // Never let object metadata turn an image URL into an HTML/script response.
    headers.set('Content-Type', TYPES[key.split('.').pop().toLowerCase()]);
    headers.set('Content-Disposition', 'inline');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
    headers.delete('Set-Cookie');
    headers.set('ETag', object.httpEtag);
    headers.set('Last-Modified', object.uploaded.toUTCString());
    headers.set('Content-Length', String(object.size));
    const versioned = /\.[a-f0-9]{12,64}\.[a-z]+$/i.test(key);
    headers.set('Cache-Control', versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, s-maxage=86400');
    const response = new Response(request.method === 'HEAD' ? null : object.body, {headers});
    // Only full GET successes enter the edge cache; never store errors or 304s.
    if (edgeCache && ctx?.waitUntil && request.method === 'GET') {
      ctx.waitUntil(edgeCache.put(cacheRequest, response.clone()).catch(() => {}));
    }
    return conditionalResponse(request, response);
  } catch {
    return error(503, 'Image storage unavailable');
  }
}
