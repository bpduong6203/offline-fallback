export const MERIT_CLIENT_SCRIPT = `(() => {
  let balance = 0;
  const notify = () => window.dispatchEvent(new CustomEvent('mebi-merit-change', { detail: balance }));
  const sendChange = async (delta, legacyImport = false) => {
    const response = await fetch('/api/merit', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta, ...(legacyImport ? { legacyImport: true } : {}) })
    });
    if (!response.ok) throw new Error('Không lưu được công đức');
    const data = await response.json();
    balance = data.balance;
    notify();
    return balance;
  };
  const ready = fetch('/api/merit', { credentials: 'same-origin' }).then(async (response) => {
    if (!response.ok) throw new Error('Không tải được công đức');
    const data = await response.json();
    balance = data.balance;
    if (data.canImportLegacy) {
      let legacy = 0;
      try { legacy = Math.max(0, Number.parseInt(localStorage.getItem('chua-mebi-merit-v1'), 10) || 0); }
      catch {}
      if (legacy > 0) {
        await sendChange(legacy, true);
        try { localStorage.removeItem('chua-mebi-merit-v1'); } catch {}
      }
    }
    notify();
    return balance;
  });
  let queue = Promise.resolve();
  const change = (delta) => {
    const amount = Math.trunc(Number(delta));
    if (!Number.isSafeInteger(amount) || Math.abs(amount) > 100000) return Promise.reject(new Error('Điểm thay đổi không hợp lệ'));
    const operation = queue.then(async () => {
      await ready;
      return sendChange(amount);
    });
    queue = operation.catch(() => {});
    return operation;
  };
  window.MebiMerit = Object.freeze({ get: () => balance, ready, change });
})();`;

const MERIT_COOKIE = 'mebi_merit_id';
const encoder = new TextEncoder();

function getCookie(request, name) {
  for (const part of (request.headers.get('Cookie') || '').split(';')) {
    const item = part.trim();
    if (item.startsWith(name + '=')) return item.slice(name.length + 1);
  }
  return '';
}

async function signMeritId(id, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode('mebi-merit:' + id)));
  let binary = '';
  for (const byte of signature) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function verifyMeritId(id, signature, secret) {
  let raw;
  try { raw = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/') + '='), char => char.charCodeAt(0)); }
  catch { return false; }
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, raw, encoder.encode('mebi-merit:' + id));
}

export async function getMeritIdentity(request, env) {
  const secret = env.HOME_SESSION_SECRET || '';
  const token = getCookie(request, MERIT_COOKIE);
  const [id, signature] = token.split('.');
  if (/^[0-9a-f-]{36}$/i.test(id || '')) {
    if (!secret && !signature) return { id, cookie: '' };
    if (secret && /^[A-Za-z0-9_-]{43}$/.test(signature || '')) {
      if (await verifyMeritId(id, signature, secret)) return { id, cookie: '' };
    }
  }

  const newId = crypto.randomUUID();
  const value = secret ? newId + '.' + await signMeritId(newId, secret) : newId;
  const url = new URL(request.url);
  const sharedDomain = url.hostname === 'mebidev.site' || url.hostname.endsWith('.mebidev.site');
  const cookie = MERIT_COOKIE + '=' + value + (sharedDomain ? '; Domain=mebidev.site' : '') +
    '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000' + (url.protocol === 'https:' ? '; Secure' : '');
  return { id: newId, cookie };
}

export async function handleMeritRequest(request, env) {
  const url = new URL(request.url);
  if (!['GET', 'POST'].includes(request.method)) return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });
  const origin = request.headers.get('Origin');
  if (origin) {
    try { if (new URL(origin).origin !== url.origin) return new Response('Forbidden', { status: 403 }); }
    catch { return new Response('Forbidden', { status: 403 }); }
  }

  let body;
  if (request.method === 'POST') {
    if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return new Response('JSON required', { status: 415 });
    const raw = await request.text();
    if (raw.length > 1024) return new Response('Payload too large', { status: 413 });
    try { body = JSON.parse(raw); } catch { return new Response('Invalid JSON', { status: 400 }); }
  }

  const identity = await getMeritIdentity(request, env);
  const stub = env.MERIT.get(env.MERIT.idFromName(identity.id));
  const internalRequest = new Request('https://merit.internal/balance', {
    method: request.method,
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({delta:body?.delta,legacyImport:body?.legacyImport === true}) })
  });
  const result = await stub.fetch(internalRequest);
  const headers = new Headers(result.headers);
  headers.set('Cache-Control', 'no-store');
  if (identity.cookie) headers.append('Set-Cookie', identity.cookie);
  return new Response(result.body, { status: result.status, headers });
}

