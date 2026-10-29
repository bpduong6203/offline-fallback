// Chọn Durable Object theo game và chuyển tiếp WebSocket.
export function handleGameSocket(request, env, url) {
  const origin = request.headers.get('Origin');
  if (origin) {
    let ok = false;
    try { ok = new URL(origin).host === url.host; } catch (e) {}
    if (!ok) return new Response('Forbidden', { status: 403 });
  }
  const room = (url.searchParams.get('room') || '').toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(room)) return new Response('Bad room', { status: 400 });
  const g = url.searchParams.get('g');
  const game = (g === 'caro' || g === 'wolf' || g === 'sword' || g === 'bomb' || g === 'stickman' || g === 'tienlen' || g === 'uno' || g === '2048') ? g : 'pool';
  const ns = game === 'uno' ? env.UNO : (game === 'tienlen' ? env.TIENLEN : (game === 'stickman' ? env.STICKMAN : (game === 'bomb' ? env.BOMB : (game === 'wolf' ? env.WOLF : env.POOL))));
  if (!ns) return new Response('Online chưa được cấu hình', { status: 501 });
  const stub = ns.get(ns.idFromName(game + ':' + room));
  return stub.fetch(request);
}
