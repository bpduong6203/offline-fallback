// Mỗi phòng = 1 Durable Object (idFromName(mã phòng)). Server chỉ quản lý phòng chờ,
// đếm ngược, xếp hạng và relay vị trí. Vật lý chạy ở client.
export class ChibiRushRoom {
  constructor() {
    this.p = new Map(); this.phase = 'lobby'; this.host = null;
    this.fin = []; this.t0 = 0; this.timer = null; this.timer2 = null;
  }
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
    const err = m => { s.send(JSON.stringify({ t: 'err', m })); s.close(1000, 'x'); };
    if (this.p.size === 0 && !u.searchParams.get('create')) err('Phòng không tồn tại');
    else if (this.phase !== 'lobby') err('Phòng đang chơi, đợi ván sau');
    else if (this.p.size >= 8) err('Phòng đã đủ 8 người');
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
    else if (m.t === 'pos') this.all({ t: 'pos', id: me.id, x: m.x, y: m.y, z: m.z, f: m.f }, me.id);
    else if (m.t === 'start' && me.id === this.host && this.phase === 'lobby') {
      this.phase = 'count'; this.fin = []; this.t0 = Date.now() + 3000;
      this.all({ t: 'start', in: 3000 }); this.state();
      setTimeout(() => {
        if (this.phase === 'count') { this.phase = 'race'; this.timer = setTimeout(() => this.end(), 150000); }
      }, 3000);
    }
    else if (m.t === 'finish' && this.phase === 'race' && !this.fin.some(f => f.id === me.id)) {
      const ms = Date.now() - this.t0;
      this.fin.push({ id: me.id, name: me.name, ms });
      this.all({ t: 'fin', name: me.name, rank: this.fin.length, ms });
      if (this.fin.length >= this.p.size) this.end();
      else if (this.fin.length === 1) this.timer2 = setTimeout(() => this.end(), 30000);
    }
    else if (m.t === 'lobby' && me.id === this.host && this.phase === 'results') { this.phase = 'lobby'; this.state(); }
  }
  end() {
    if (this.phase !== 'race') return;
    this.phase = 'results'; clearTimeout(this.timer); clearTimeout(this.timer2);
    const list = [...this.fin.map(f => ({ name: f.name, ms: f.ms })),
      ...[...this.p.values()].filter(q => !this.fin.some(f => f.id === q.id)).map(q => ({ name: q.name, ms: null }))];
    this.all({ t: 'results', list });
  }
  drop(me) {
    if (!this.p.delete(me.id)) return;
    if (this.host === me.id) this.host = [...this.p.keys()][0] || null;
    this.all({ t: 'left', id: me.id });
    if (!this.p.size) { this.phase = 'lobby'; clearTimeout(this.timer); clearTimeout(this.timer2); return; }
    this.state();
    if (this.phase === 'race' && this.fin.length >= this.p.size) this.end();
  }
}
