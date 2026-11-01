// Chùa online 3D: mỗi "gian" (shard) là 1 Durable Object, tối đa 40 người.
// Server chỉ chuyển tiếp vị trí (x, z, trạng thái, hướng) và sự kiện (hương, mõ, lạy).
export class ChuaMebiRoom {
  constructor() { this.p = new Map(); }
  all(m, except) {
    const s = JSON.stringify(m);
    for (const q of this.p.values()) if (q.id !== except && q.joined) { try { q.ws.send(s) } catch (e) {} }
  }
  pub(q) { return { id: q.id, name: q.name, col: q.col, look: q.look, x: q.x, z: q.z, s: q.s, f: q.f }; }
  fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('ws only', { status: 426 });
    const [c, s] = Object.values(new WebSocketPair());
    s.accept();
    if (this.p.size >= 40) { s.send(JSON.stringify({ t: 'err', retry: 1 })); s.close(1000, 'full'); }
    else {
      const id = crypto.randomUUID().slice(0, 6);
      const me = { id, ws: s, joined: false, name: 'Khách', col: '#ffb3d1', look: 0, x: 0, z: 12, s: 0, f: 3.14 };
      this.p.set(id, me);
      s.send(JSON.stringify({ t: 'hello', id }));
      s.addEventListener('message', e => this.msg(me, e.data));
      s.addEventListener('close', () => this.drop(me));
      s.addEventListener('error', () => this.drop(me));
    }
    return new Response(null, { status: 101, webSocket: c });
  }
  msg(me, raw) {
    let m; try { m = JSON.parse(raw) } catch (e) { return }
    if (m.t === 'join' && !me.joined) {
      me.name = String(m.name || 'Khách').slice(0, 14);
      me.col = /^#[0-9a-f]{6}$/i.test(m.col) ? m.col : '#ffb3d1';
      me.look = (m.look | 0) % 3; me.joined = true;
      me.ws.send(JSON.stringify({ t: 'list', list: [...this.p.values()].filter(q => q.joined && q !== me).map(q => this.pub(q)) }));
      this.all({ t: 'in', p: this.pub(me) }, me.id);
    } else if (m.t === 'p' && me.joined) {
      me.x = Math.max(-20, Math.min(20, +m.x || 0)); me.z = Math.max(-20, Math.min(22, +m.z || 0));
      me.s = [0, 1, 2].includes(m.s) ? m.s : 0; me.f = Math.max(-7, Math.min(7, +m.f || 0));
      this.all({ t: 'p', id: me.id, x: me.x, z: me.z, s: me.s, f: me.f }, me.id);
    } else if (m.t === 'ev' && me.joined && ['h', 'm', 'b'].includes(m.k)) {
      this.all({ t: 'ev', id: me.id, k: m.k }, me.id);
    }
  }
  drop(me) { if (this.p.delete(me.id)) this.all({ t: 'out', id: me.id }); }
}

