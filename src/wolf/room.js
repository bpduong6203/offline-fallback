import { WolfEngine, WOLF_MAX } from './engine.js';

// Durable Object: mỗi phòng Ma sói một instance, WebSocket kiểu thường (giữ trong bộ nhớ khi còn người kết nối).
export class WolfRoom {
  constructor(state, env) {
    this.state = state;
    this.engine = new WolfEngine();
  }

  async fetch(request) {
    const full = this.engine.phase === 'lobby' && this.engine.players.size >= WOLF_MAX;
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response(full ? 'Room full' : 'Expected WebSocket', { status: full ? 409 : 426 });
    }
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    let pid = null;
    const send = (o) => { try { server.send(JSON.stringify(o)); } catch (e) {} };
    server.addEventListener('message', (ev) => {
      if (typeof ev.data !== 'string' || ev.data.length > 1000) return;
      let m;
      try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (!m || typeof m !== 'object') return;
      if (pid === null) {
        if (m.t === 'join') pid = this.engine.join(m, send);
        return;
      }
      this.engine.handle(pid, m);
    });
    const onGone = () => { if (pid !== null) this.engine.leave(pid, send); };
    server.addEventListener('close', onGone);
    server.addEventListener('error', onGone);
    return new Response(null, { status: 101, webSocket: client });
  }
}
