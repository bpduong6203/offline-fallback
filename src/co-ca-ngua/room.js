import { Match } from './logic.js';

// Mỗi phòng = 1 Durable Object (idFromName(mã phòng)). Server giữ ván cờ, tự tung xúc xắc và kiểm tra nước đi.
export class CoCaNguaRoom {
  constructor() { this.p = new Map(); this.phase = 'lobby'; this.host = null; this.match = null; }
  all(m, except) {
    const s = JSON.stringify(m);
    for (const q of this.p.values()) if (q.id !== except) { try { q.ws.send(s) } catch (e) {} }
  }
  state() {
    this.all({ t: 'state', phase: this.phase, host: this.host,
      players: [...this.p.values()].map(q => ({ id: q.id, name: q.name, slot: q.slot })) });
  }
  fetch(req) {
    const u = new URL(req.url);
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('ws only', { status: 426 });
    const [c, s] = Object.values(new WebSocketPair());
    s.accept();
    const err = (m, retry) => { s.send(JSON.stringify({ t: 'err', m, retry: retry ? 1 : 0 })); s.close(1000, 'x'); };
    if (this.p.size === 0 && !u.searchParams.get('create')) err('Phòng không tồn tại');
    else if (this.phase !== 'lobby') err('Phòng đang chơi, đợi ván sau', true);
    else if (this.p.size >= 4) err('Phòng đã đủ 4 người', true);
    else {
      const id = crypto.randomUUID().slice(0, 6);
      const used = new Set([...this.p.values()].map(q => q.slot));
      let slot = 0; while (used.has(slot)) slot++;
      const me = { id, ws: s, name: 'Bạn', slot };
      this.p.set(id, me);
      if (!this.host) this.host = id;
      s.send(JSON.stringify({ t: 'hello', id }));
      s.addEventListener('message', e => this.msg(me, e.data));
      s.addEventListener('close', () => this.drop(me));
      s.addEventListener('error', () => this.drop(me));
    }
    return new Response(null, { status: 101, webSocket: c });
  }
  msg(me, raw) {
    let m; try { m = JSON.parse(raw) } catch (e) { return }
    if (m.t === 'join') { me.name = String(m.name || 'Bạn').slice(0, 12); this.state(); }
    else if (m.t === 'start' && me.id === this.host && this.phase === 'lobby' && this.p.size >= 2) {
      const seats = [0, 1, 2, 3].map(s => {
        const q = [...this.p.values()].find(x => x.slot === s);
        return q ? { name: q.name, id: q.id } : { name: 'Máy ' + (s + 1), bot: 1 };
      });
      this.phase = 'play';
      this.match = new Match(msg => { this.all(msg); if (msg.t === 'over') this.phase = 'results'; }, seats.map(x => !x.bot));
      this.all({ t: 'start', seats });
      this.match.start();
    }
    else if ((m.t === 'roll' || m.t === 'move') && this.match && this.phase === 'play') this.match.input(me.slot, m);
    else if (m.t === 'lobby' && me.id === this.host && this.phase === 'results') {
      if (this.match) this.match.stop(); this.match = null; this.phase = 'lobby'; this.state();
    }
  }
  drop(me) {
    if (!this.p.delete(me.id)) return;
    if (this.host === me.id) this.host = [...this.p.keys()][0] || null;
    if (this.match) this.match.human[me.slot] = false; // máy chơi thay
    this.all({ t: 'left', id: me.id });
    if (!this.p.size) { if (this.match) this.match.stop(); this.match = null; this.phase = 'lobby'; return; }
    this.state();
  }
}
