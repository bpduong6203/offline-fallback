// Handler phục vụ tài nguyên ảnh tĩnh từ Cloudflare R2 (Binding: IMAGES)
// Hỗ trợ an toàn đường dẫn, định dạng Content-Type, ETag và Cache-Control.

const MIME_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
  ico: 'image/x-icon',
  avif: 'image/avif',
  bmp: 'image/bmp'
};

/**
 * Trả về Content-Type tương ứng với phần mở rộng tệp tin
 * @param {string} filename 
 * @returns {string} MIME Type
 */
export function getMimeType(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Kiểm tra tính hợp lệ của key asset nhằm ngăn chặn path traversal và ký tự nguy hiểm
 * @param {string} key 
 * @returns {boolean}
 */
export function isValidAssetKey(key) {
  if (!key || typeof key !== 'string') return false;
  // Chặn đường dẫn bắt đầu bằng /, chứa .., dấu gạch chéo ngược \, ký tự null, hoặc khoảng trắng đầu/cuối
  if (
    key.startsWith('/') ||
    key.startsWith('\\') ||
    key.includes('..') ||
    key.includes('\\') ||
    key.includes('\0')
  ) {
    return false;
  }
  // Chặn các chuỗi mã hóa URL traversal nguy hiểm
  if (/%2e%2e|%2f|%5c/i.test(key)) {
    return false;
  }
  return true;
}

/**
 * Xử lý request đọc ảnh tĩnh từ R2 theo route /__assets/<path>
 * @param {Request} request 
 * @param {object} env 
 * @returns {Promise<Response>}
 */
export async function handleAssetRequest(request, env) {
  const url = new URL(request.url);

  // Chỉ cho phép GET và HEAD
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' }
    });
  }

  const prefix = '/__assets/';
  if (!url.pathname.startsWith(prefix)) {
    return new Response('Not Found', { status: 404 });
  }

  const rawKey = url.pathname.slice(prefix.length);
  let key;
  try {
    key = decodeURIComponent(rawKey);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Chặn truy cập đường dẫn không hợp lệ, đặc biệt là ..
  if (!isValidAssetKey(key)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Kiểm tra binding R2
  if (!env || !env.IMAGES) {
    return new Response('R2 binding IMAGES not configured', { status: 503 });
  }

  let object;
  try {
    object = await env.IMAGES.get(key);
  } catch (err) {
    console.error('R2 get error:', err);
    return new Response('Storage Error', { status: 500 });
  }

  // Xử lý ảnh không tồn tại bằng HTTP 404
  if (!object) {
    return new Response('Asset Not Found', { status: 404 });
  }

  const headers = new Headers();
  if (typeof object.writeHttpMetadata === 'function') {
    object.writeHttpMetadata(headers);
  }

  if (object.httpEtag) {
    headers.set('ETag', object.httpEtag);
  }

  // Đảm bảo có đúng Content-Type nếu metadata chưa khai báo
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', getMimeType(key));
  }

  // Bật cache phù hợp cho ảnh tĩnh: 1 năm, immutable, stale-while-revalidate
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  // Xử lý If-None-Match (HTTP 304 Not Modified)
  const clientEtag = request.headers.get('If-None-Match');
  if (clientEtag && object.httpEtag && clientEtag === object.httpEtag) {
    return new Response(null, { status: 304, headers });
  }

  if (request.method === 'HEAD') {
    return new Response(null, { status: 200, headers });
  }

  return new Response(object.body, { status: 200, headers });
}
