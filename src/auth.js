const COOKIE_NAME = 'game_library_session';
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

function json(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers }
  });
}

function getCookie(request) {
  const cookies = request.headers.get('Cookie') || '';
  for (const part of cookies.split(';')) {
    const item = part.trim();
    if (item.startsWith(COOKIE_NAME + '=')) return item.slice(COOKIE_NAME.length + 1);
  }
  return '';
}

async function hmacKey(secret, usage) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage);
}

async function signSession(expiresAt, username, secret) {
  const key = await hmacKey(secret, ['sign']);
  const payload = encoder.encode(username + ':' + expiresAt);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, payload));
  let binary = '';
  for (const byte of signature) binary += String.fromCharCode(byte);
  const encoded = btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return String(expiresAt) + '.' + encoded;
}

async function hasValidSession(request, env) {
  const secret = env.HOME_SESSION_SECRET;
  if (!secret) return false;
  const token = getCookie(request);
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const expiresAt = Number(token.slice(0, dot));
  const signatureText = token.slice(dot + 1);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + SESSION_SECONDS || !/^[A-Za-z0-9_-]{43}$/.test(signatureText)) return false;
  let signature;
  try {
    const base64 = signatureText.replace(/-/g, '+').replace(/_/g, '/') + '=';
    signature = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
  } catch {
    return false;
  }
  const key = await hmacKey(secret, ['verify']);
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(env.HOME_LOGIN_USERNAME + ':' + expiresAt));
}

export async function handleAuthRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/auth/session' && request.method === 'GET') {
    return json({ authenticated: await hasValidSession(request, env) });
  }
  if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
    return json({ authenticated: false }, 200, {
      'Set-Cookie': COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' + (url.protocol === 'https:' ? '; Secure' : '')
    });
  }
  if (url.pathname !== '/api/auth/login' || request.method !== 'POST') {
    return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return json({ error: 'Yêu cầu không hợp lệ.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return json({ error: 'Định dạng yêu cầu không hợp lệ.' }, 415);
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 2048) return json({ error: 'Yêu cầu quá lớn.' }, 413);
  if (!env.HOME_LOGIN_USERNAME || !env.HOME_LOGIN_PASSWORD || !env.HOME_SESSION_SECRET) {
    return json({ error: 'Đăng nhập chưa được cấu hình trên máy chủ.' }, 503);
  }
  let credentials;
  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > 2048) return json({ error: 'Yêu cầu quá lớn.' }, 413);
    credentials = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return json({ error: 'Thông tin đăng nhập không hợp lệ.' }, 400);
  }
  const username = typeof credentials?.username === 'string' ? credentials.username.slice(0, 256) : '';
  const password = typeof credentials?.password === 'string' ? credentials.password.slice(0, 256) : '';
  const [usernameMatches, passwordMatches] = await Promise.all([
    matchesSecret(username, env.HOME_LOGIN_USERNAME),
    matchesSecret(password, env.HOME_LOGIN_PASSWORD)
  ]);
  if (!(usernameMatches && passwordMatches)) return json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }, 401);

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = await signSession(expiresAt, env.HOME_LOGIN_USERNAME, env.HOME_SESSION_SECRET);
  return json({ authenticated: true }, 200, {
    'Set-Cookie': COOKIE_NAME + '=' + token + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + SESSION_SECONDS + (url.protocol === 'https:' ? '; Secure' : '')
  });
}

async function matchesSecret(provided, expected) {
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(provided)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected))
  ]);
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}

export function requiresGameLogin(url) {
  if (url.searchParams.has('game')) return true;
  const path = url.pathname;
  return path.startsWith('/__game/') || path.startsWith('/api/monopoly/') || [
    '/ty-phu', '/ty-phu/', '/chibi-rush', '/chibi-rush/',
    '/tien-len', '/tien-len/', '/uno', '/uno/', '/stickman-fight', '/stickman-fight/'
  ].includes(path);
}

export async function requireGameLogin(request, env) {
  if (!env?.HOME_SESSION_SECRET) return true;
  return hasValidSession(request, env);
}
